from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from langchain_openai import AzureOpenAIEmbeddings
from langchain_community.document_loaders import AzureBlobStorageContainerLoader
from langchain.text_splitter import CharacterTextSplitter
from mongo_helper import create_collection, create_document, drop_collection, delete_document, get_collections, get_documents
from blob_storage_helper import createContainer, delete_blob_storage_container, upload_to_azure_blob_storage, delete_from_azure_blob_storage, generate_sas_token
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.indexes.models import  SearchIndex, SearchField, SearchFieldDataType, SimpleField, SearchableField, VectorSearch, VectorSearchProfile, HnswAlgorithmConfiguration
from dotenv import load_dotenv
import uuid
from pathlib import Path
from azure.storage.blob import BlobServiceClient

load_dotenv()

app = Flask(__name__)
CORS(app)

connection_string = os.environ.get('AZURE_CONN_STRING')

embeddings = AzureOpenAIEmbeddings(
            azure_deployment="FYP-SCSE23-1127-text-embedding-ada-002", 
            api_key=os.environ.get('OPENAI_API_KEY'),
            azure_endpoint=os.environ.get('AZURE_ENDPOINT')
        )
blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_CONN_STRING'))

@app.route("/vectorstore", methods=['POST'])
def StoreDocuments():
    data = request.json
    containername = data.get('containername')

    if not containername:
        return jsonify({"error": "Container name is required"}), 400
    
    docs_to_add = []
    docs_to_update = []
    docs_to_update_id = []
    
    docs_to_add_final= []
    docs_to_add_page_content = []
    docs_to_add_embeddings = []
    docs_to_add_filename = []

    docs_to_update_final = []
    docs_to_update_page_content = []
    docs_to_update_embeddings = []
    docs_to_update_filename = []

    try:   
        search_client = SearchClient(endpoint=os.environ.get('AZURE_COGNITIVE_SEARCH_ENDPOINT'), index_name=containername, credential=AzureKeyCredential(os.environ.get('AZURE_COGNITIVE_SEARCH_API_KEY')))

        loader = AzureBlobStorageContainerLoader(
                 conn_str=os.environ.get('AZURE_CONN_STRING'),
                 container= containername,
                 prefix='new/'
        )
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        documents = loader.load()


        for doc in documents:
            path_to_check = doc.metadata['source']
            filename_to_check = Path(path_to_check).name
            search_results = search_client.search(filter=f"filename eq '{filename_to_check}'")
            first_result = next(search_results, None)
            if first_result is not None:
                   search_results = search_client.search(filter=f"filename eq '{filename_to_check}'")
                   print("update!")
                   for result in search_results:
                       print(result['filename'])
                       docs_to_update_id.append(result['id'])
                           
                   split_docs_to_update = text_splitter.split_documents([doc])
                   for sdoc in split_docs_to_update:
                       docs_to_update.append(sdoc)                    
            else:
                print("add!")
                split_docs_to_add = text_splitter.split_documents([doc])
                for adoc in split_docs_to_add:
                    docs_to_add.append(adoc)    

        for doc in docs_to_update:
            path_to_update = doc.metadata['source']
            filename_to_update = Path(path_to_update).name
            docs_to_update_filename.append(filename_to_update)
            docs_to_update_page_content.append(doc.page_content)
        
        for doc in docs_to_add:
            path_to_add = doc.metadata['source']
            filename_to_add = Path(path_to_add).name
            docs_to_add_filename.append(filename_to_add)
            docs_to_add_page_content.append(doc.page_content)

        docs_to_update_embeddings = embeddings.embed_documents(docs_to_update_page_content)
        docs_to_add_embeddings = embeddings.embed_documents(docs_to_add_page_content)

        if(len(docs_to_update_page_content) != 0):
            for i in range(len(docs_to_update_page_content)):
                docs_to_update_final.append({
                    'id': docs_to_update_id[i],
                    'content': docs_to_update_page_content[i],
                    'content_vector': docs_to_update_embeddings[i],
                    'filename': docs_to_update_filename[i]
                })

            search_client.merge_documents(docs_to_update_final)

        if(len(docs_to_add_page_content) != 0):
            for i in range(len(docs_to_add_page_content)):
                docs_to_add_final.append({
                    'id': str(uuid.uuid4()),
                    'content': docs_to_add_page_content[i],
                    'content_vector': docs_to_add_embeddings[i],
                    'filename': docs_to_add_filename[i]
                })

            search_client.upload_documents(docs_to_add_final)

        return jsonify({"message": "Data loaded into vectorstore successfully"}), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/createindex", methods=['PUT'])
def createIndex():
    data = request.json
    collection_name = data.get('collectionName')
    print(collection_name)
    client = SearchIndexClient(os.environ.get('AZURE_COGNITIVE_SEARCH_ENDPOINT'), AzureKeyCredential(os.environ.get('AZURE_COGNITIVE_SEARCH_API_KEY')))
    fields = [
    SimpleField(
        name="id",
        type=SearchFieldDataType.String,
        key=True,
        searchable=True,
        filterable=True,
        retrievable=True,
        stored=True,
        sortable=False,
        facetable=False
    ),
    SearchableField(
        name="content",
        type=SearchFieldDataType.String,
        searchable=True,
        filterable=False,
        retrievable=True,
        stored=True,
        sortable=False,
        facetable=False
    ),
    SearchField(
        name="content_vector", 
        type=SearchFieldDataType.Collection(SearchFieldDataType.Single),
        searchable=True, 
        vector_search_dimensions=1536, 
        vector_search_profile_name="my-vector-config"),

    SearchableField(
        name="filename",
        type=SearchFieldDataType.String,
        filterable=True,
        sortable=True,
    )
  ]

    vector_search = VectorSearch(
        profiles=[VectorSearchProfile(name="my-vector-config", algorithm_configuration_name="my-algorithms-config")],
        algorithms=[HnswAlgorithmConfiguration(name="my-algorithms-config")],
    )

    try:
        searchindex = SearchIndex(name=collection_name, fields=fields, vector_search=vector_search)
        result = client.create_or_update_index(index=searchindex)

        return jsonify({"message": "Index created successfully successfully"}), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500

    
@app.route('/api/createcollection', methods=['PUT'])
def create_course():
    data = request.json
    collection_name = data.get('collectionName')
    collection_name = collection_name.lower().replace(' ', '-')
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400
    try:
        create_success_container = createContainer(collection_name)
        if create_success_container:
            create_success_collection = create_collection(collection_name)
            if create_success_collection:
                print("collection created successfully!")
                return jsonify({"message": "Collection created successfully!"}), 201
            else:
                return jsonify({'error': 'Failed to create collection'}), 500
        else:
            return jsonify({'error': 'Failed to create container'}), 500
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/collections', methods=['GET'])
def get_containers():
    collections =  get_collections()
    return jsonify(collections), 201

@app.route('/api/collections/<collection_name>', methods=['GET'])
def get_files(collection_name):
    documents = get_documents(collection_name)
    return jsonify(documents), 201
   
    
@app.route('/api/<collection_name>/createdocument', methods=['PUT'])
def upload_document(collection_name):
    files = request.files.getlist('files')
    container_name = collection_name.lower().replace(' ', '-')
    files_with_links = []
    try:
        upload_success = upload_to_azure_blob_storage(container_name, files)
        if upload_success:
            for file in files:
                sas_token = generate_sas_token(collection_name, file.filename)
                blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{file.filename}?{sas_token}"
                files_with_links.append({
                    "name": file.filename,
                    "url": blob_url
                })
            create_document_success = create_document(collection_name, files_with_links)
            if create_document_success:
                print("documents created successfully!")
                return jsonify({"message": "Documents created successfully!"}), 201
            else:
                return jsonify({'error': 'Failed to create documents'}), 500
        else:
            return jsonify({'error': 'Failed to upload files to Azure Blob Storage'}), 500
    except Exception as error:
            print(f"Error processing files upload: {error}")
            return jsonify({'error': 'Internal server error'}), 500
    

@app.route('/api/dropcollection', methods=['DELETE'])
def delete_course():
    data = request.json
    collection_name = data.get('collectionName')
    collection_name = collection_name.lower().replace(' ', '-')
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400
    try:
        delete_success_container = delete_blob_storage_container(collection_name)
        if delete_success_container:
            delete_success_collection = drop_collection(collection_name)
            if delete_success_collection:
                print("collection deleted successfully!")
                return jsonify({"message": "Collection deleted successfully!"}), 201
            else:
                return jsonify({'error': 'Failed to delete collection'}), 500
        else:
            return jsonify({'error': 'Failed to delete container'}), 500
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/<collection_name>/deletedocument', methods=['DELETE'])
def delete_file(collection_name):
    data = request.json
    file_name = data.get('fileName')
    file_id = data.get('_id')
    container_name = collection_name.lower().replace(' ', '-')
    try:
        delete_success = delete_from_azure_blob_storage(container_name, file_name)
        if delete_success:
            delete_document_success =  delete_document(collection_name, file_id)
            if delete_document_success:
                 print("document deleted successfully!")
                 return jsonify({"message": "Document deleted successfully!"}), 201
            else:
                return jsonify({'error': 'Failed to delete document'}), 500
        else:
            return jsonify({'error': 'Failed to upload file to Azure Blob Storage'}), 500
    except Exception as error:
            print(f"Error processing file upload: {error}")
            return jsonify({'error': 'Internal server error'}), 500
    
@app.route("/api/<collection_name>/deleteembeddings", methods=['DELETE'])
def DeleteEmbeddings(collection_name):
    data = request.json
    blobName = data.get('fileName')
    search_client = SearchClient(os.environ.get('AZURE_COGNITIVE_SEARCH_ENDPOINT'), collection_name, AzureKeyCredential(os.environ.get('AZURE_COGNITIVE_SEARCH_API_KEY')))
    try: 
        print(blobName)     
        search_result = search_client.search(filter=f"filename eq '{blobName}'")
        ids_to_delete = []
        for result in search_result:
            print(result['id'])
            ids_to_delete.append({'id': result['id']})
        
        if(len(ids_to_delete) != 0):
            search_client.delete_documents(ids_to_delete)

        return jsonify({"message": "Data deleted from vectorstore successfully"}), 201

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/dropIndex', methods=['DELETE'])
def delete_index():
    data = request.json
    collection_name = data.get('collectionName')
    collection_name = collection_name.lower().replace(' ', '-')
    client = SearchIndexClient(os.environ.get('AZURE_COGNITIVE_SEARCH_ENDPOINT'), AzureKeyCredential(os.environ.get('AZURE_COGNITIVE_SEARCH_API_KEY')))
    try:
       client.delete_index(collection_name)
       return jsonify({"message": "Index deleted successfully"}), 201
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)