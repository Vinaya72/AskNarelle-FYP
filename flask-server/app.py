from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from mongo_helper import  create_document, delete_all_course_documents, delete_document,  get_documents, update_movement_document, get_chatlogs, upload_course, list_courses, upload_domain, get_domain_files, delete_domain_docs, get_course_files_count, get_domain_files_count, get_users_count, get_queries_count, get_queries_by_month, get_queries_by_course, get_user_sentiments, get_user_emotions
from blob_storage_helper import createContainer, delete_blob_storage_container, upload_to_azure_blob_storage, delete_from_azure_blob_storage,delete_domain_virtual_folder, generate_sas_token
from ai_search_helper import storeDocuments, moveToVectorStoreFunction,createIndexFucntion, delete_index_function, delete_embeddings_function
from dotenv import load_dotenv
from azure.storage.blob import BlobServiceClient
from datetime import datetime
import pytz

load_dotenv()

app = Flask(__name__)
CORS(app)


blob_service_client = BlobServiceClient.from_connection_string(os.environ.get('AZURE_CONN_STRING'))

@app.route("/vectorstore", methods=['PUT'])
def storeInVectorStore():
    data = request.json
    containername = data.get('containername')
    chunksize= int(data.get('chunksize'))
    overlap = int(data.get('overlap'))

    store_status = storeDocuments(containername, chunksize, overlap)
    if(store_status):
        return jsonify({"message": "Data loaded into vectorstore successfully"}), 201
    else:
        return jsonify({"message": "Data failed to store into successfully"}), 500

   
@app.route("/movetovectorstore", methods=['PUT'])
def moveToVectorStore():
    data = request.json
    containername = data.get('containername')
    domainname = data.get('domainname')
    versionid = data.get('versionid')
    chunksize= int(data.get('chunksize'))
    overlap = int(data.get('overlap'))
    filename = data.get('filename')

    movement_status = moveToVectorStoreFunction(containername, domainname, versionid, chunksize, overlap, filename)
    if movement_status:  
        return jsonify({"message": "Data moved into into vectorstore successfully"}), 201
    else:
        return jsonify({"message": "Data failed to move into store"}), 500


@app.route("/createindex", methods=['PUT'])
def createIndex():
    data = request.json
    collection_name = data.get('collectionName')
    create_index_status =  createIndexFucntion(collection_name)
    if create_index_status:  
        return jsonify({"message": "Index created successfully"}), 201
    else:
        return jsonify({"message": "Failed to create index"}), 500

    
@app.route('/api/createcollection', methods=['PUT'])
def create_course():
    data = request.json
    collection_name = data.get('collectionName')
    username = data.get('username')

    collection_name = collection_name.lower().replace(' ', '-')
    if not collection_name:
        return jsonify({"error": "Collection name is required"}), 400
    try:
        create_success_container = createContainer(collection_name)
        if create_success_container:
                uploaded_course = upload_course(collection_name, username)
                if uploaded_course:
                    return jsonify({"message": "Container and course created successfully!"}), 201
                else:
                    return jsonify({"message": "Failed to upload course"}), 500
        else:
            return jsonify({'error': 'Failed to create container'}), 500
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/createdomain', methods=['PUT'])
def create_domain():
    data=request.json
    domain_name = data.get('domainName')
    collection_name = data.get('courseName')

    domain_name = domain_name.lower().replace(' ', '-')
    try:
        upload_domain_success = upload_domain(domain_name, collection_name)
        if upload_domain_success:
            return jsonify({"message": "Domain created successfully!"}), 201
        else:
            return jsonify({"message": "Failed to create domain"}), 500
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500 


@app.route('/api/collections/<username>', methods=['GET'])
def get_containers(username):
    containers =  list_courses(username)
    return jsonify(containers), 201

@app.route('/api/collections/<username>/<collection_name>/domains', methods=['GET'])
def get_domains(username,collection_name):
    domain_status = get_domain_files(username,collection_name)

    if domain_status == "403":
       return jsonify({"message": "User is not authorised to access this page"}), 403
    elif domain_status == "404":
       return jsonify({"message": "This page is not available"}), 404
    elif domain_status == "Flase":
        return jsonify({"message": "Error fetch course domains"}), 500
    else:
        return jsonify(domain_status), 201

@app.route('/api/collections/<username>/<collection_name>/<domain_name>', methods=['GET'])
def get_files(username,collection_name, domain_name):
    documents_status = get_documents(username,collection_name, domain_name)
    print(documents_status)

    if documents_status == "403":
       return jsonify({"message": "User is not authorised to access this page"}), 403
    elif documents_status == "404":
       return jsonify({"message": "This page is not available"}), 404
    elif documents_status == "Flase":
        return jsonify({"message": "Error fetch course files"}), 500
    else:
        return jsonify(documents_status), 201
   
    
@app.route('/api/<collection_name>/<domain_name>/createdocument', methods=['PUT'])
def upload_document(collection_name, domain_name):
    files = request.files.getlist('files')
    container_name = collection_name.lower().replace(' ', '-')
    files_with_links = []
    try:
        now_utc = datetime.now(pytz.utc)
        container_client = blob_service_client.get_container_client(collection_name)
        upload_success = upload_to_azure_blob_storage(container_name, files, domain_name)
        if upload_success:
            for file in files:
                blob_client_direct = container_client.get_blob_client(f"{domain_name}/{file.filename}")
                blob_version = blob_client_direct.get_blob_properties().version_id
                main_part, fractional_part = blob_version[:-1].split('.')
                fractional_part = fractional_part[:6] 
                adjusted_timestamp_str = f"{main_part}.{fractional_part}Z"
                timestamp_dt = datetime.strptime(adjusted_timestamp_str, '%Y-%m-%dT%H:%M:%S.%fZ')

                date_str = timestamp_dt.date().isoformat()
                time_str = timestamp_dt.time().isoformat()
                print(date_str)
                print(time_str)

                print(f"this is blob version: {blob_version}")
                sas_token = generate_sas_token(container_name, f'{domain_name}/{file.filename}')
                blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{f'{domain_name}/{file.filename}'}?{sas_token}"
                files_with_links.append({
                    "name": file.filename,
                    "url": blob_url,
                    "blob_name": f'{domain_name}/{file.filename}',
                    "domain": domain_name,
                    "version_id": blob_version,
                    "date_str": date_str,
                    "time_str": time_str,
                    "in_vector_store": 'yes',
                    "is_root_blob": 'yes',
                    "course_name" : container_name
                })
            create_document_success = create_document(files_with_links)
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
            delete_all_course_docs = delete_all_course_documents(collection_name)
            if(delete_all_course_docs):
                return jsonify({"message": "Container deleted successfully!"}), 201
            else:
                return jsonify({"message: Failed to delete the documents"}), 500
        else:
            return jsonify({'error': 'Failed to delete contaier'}), 500
        
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/deletedomain', methods=['DELETE'])
def delete_domain():
    data = request.json
    course_name = data.get('collectionName')
    domain_name = data.get('domainName')

    try:
        delete_success_domain_folder = delete_domain_virtual_folder(course_name, domain_name)
        if delete_success_domain_folder:
            delete_success_domain_docs = delete_domain_docs(course_name, domain_name)
            if delete_success_domain_docs:
                return jsonify({"message": "Domain deleted successfully!"}), 201
            else:
                    return jsonify({"message: Failed to delete the domain documents"}), 500
        else:
            return jsonify({'error': 'Failed to delete contaier'}), 500
    except Exception as error:
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/<collection_name>/<domain_name>/deletedocument', methods=['DELETE'])
def delete_file(collection_name, domain_name):
    data = request.json
    file_name = data.get('fileName')
    file_id = data.get('_id')
    version_id = data.get('versionId')
    is_root_blob = data.get('isRootBlob')
    container_name = collection_name.lower().replace(' ', '-')
    try:
        delete_success = delete_from_azure_blob_storage(container_name, file_name, domain_name, version_id, is_root_blob)
        if delete_success:
            delete_document_success =  delete_document(collection_name, file_id, is_root_blob, file_name)
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

    embeddings_delete_status = delete_embeddings_function(blobName, collection_name)
    
    if embeddings_delete_status:  
        return jsonify({"message": "Embeddings deleted successfully"}), 201
    else:
        return jsonify({"message": "Failed to delete embeddings"}), 500
    
    
@app.route('/api/dropIndex', methods=['DELETE'])
def delete_index():
    data = request.json
    collection_name = data.get('collectionName')
    collection_name = collection_name.lower().replace(' ', '-')

    index_deletion_status = delete_index_function(collection_name)

    if index_deletion_status:  
        return jsonify({"message": "Index deleted successfully"}), 201
    else:
        return jsonify({"message": "Failed to delete index"}), 500
   
    
@app.route('/updatemovement', methods=['PUT'])
def update_movement():
    data = request.json
    collection_name = data.get('collectionName')
    domain_name = data.get('domainName')
    file_name = data.get('fileName')
    version_id = data.get('versionId')
    try:
        create_document_success = update_movement_document(collection_name, file_name, version_id)
        if create_document_success:
            print("documents created successfully!")
            return jsonify({"message": "Documents created successfully!"}), 201
        else:
            return jsonify({'error': 'Failed to create documents'}), 500
        
    except Exception as error:
            print(f"Error processing files upload: {error}")
            return jsonify({'error': 'Internal server error'}), 500

@app.route('/get-chats', methods=['GET'])
def get_chats():
    chats = get_chatlogs()
    # print(chats)
    return jsonify(chats), 201

@app.route('/api/<course_name>/totalFiles', methods = ['GET'])
def getTotalCourseFiles(course_name):
    courseFilesCount = get_course_files_count(course_name)
    if courseFilesCount == "False":
       return jsonify({'message': 'Error fetching files count'}), 500
    else:
        return jsonify(courseFilesCount), 201
    
@app.route('/api/<course_name>/<domain_name>/totalFiles', methods = ['GET'])
def getTotalDomainFiles(course_name, domain_name):
    domainFilesCount = get_domain_files_count(course_name, domain_name)
    if domainFilesCount == "False":
       return jsonify({'message': 'Error fetching files count'}), 500
    else:
        return jsonify(domainFilesCount), 201
    
@app.route('/chats/totalUsers/<username>', methods = ['GET'])
def getTotalUsers(username):
    usersCount = get_users_count(username)
    if usersCount == "False":
       return jsonify({'message': 'Error fetching files count'}), 500
    else:
        return jsonify(usersCount), 201
    
@app.route('/chats/totalQueries/<username>', methods = ['GET'])
def getTotalQueries(username):
    queriesCount = get_queries_count(username)
    if queriesCount == "False":
       return jsonify({'message': 'Error fetching files count'}), 500
    else:
        return jsonify(queriesCount), 201

@app.route('/chats/queriesByMonth/<username>', methods=['GET'])
def getQueriesByMonth(username):
    queries_by_month = get_queries_by_month(username)
    if queries_by_month == "False":
        return jsonify({'message': 'Error fetching files count'}), 500
    else:
        return queries_by_month, 201
    
@app.route('/chats/queriesByCourse/<username>', methods=['GET'])
def getQueriesByCourse(username):
    queries_by_course = get_queries_by_course(username)
    if queries_by_course == "False":
        return jsonify({'message': 'Error fetching query count by course'}), 500
    else:
        return queries_by_course, 201
    
@app.route('/chats/userSentiments/<username>', methods=['GET'])
def getUserSentiments(username):
    user_sentiments = get_user_sentiments(username)
    if user_sentiments == "False":
        return jsonify({'message': 'Error fetching user sentiments'}), 500
    else:
        return user_sentiments, 201
    
@app.route('/chats/userEmotions/<username>', methods=['GET'])
def getUserEmotions(username):
    user_emotions = get_user_emotions(username)
    if user_emotions == "False":
        return jsonify({'message': 'Error fetching user emotions'}), 500
    else:
        return user_emotions, 201





if __name__ == "__main__":
    app.run(debug=True)