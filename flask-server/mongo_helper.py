from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId



load_dotenv()

# db_name = os.environ.get('DB_NAME')
# key = os.environ.get('KEY')
# cosmos_port = os.environ.get('COSMOS_PORT')

mongo_uri = os.environ.get('MONGO_URI')
chat_mongo_uri = os.environ.get('CHAT_MONGO_URI')

client = MongoClient(mongo_uri)
chat_client = MongoClient(chat_mongo_uri)

db = client['file_database']
chatlogs_db = chat_client['chathistory-storage']



def create_collection(collectionName):
    try:
        db.create_collection(collectionName)
        print("done!")
        return True
    except Exception as e:
        print(e)
        return False

def drop_collection(collectionName):
    try:
        db.drop_collection(collectionName)
        return True
    except Exception as e:
        return False
    
def create_document(collectionName, files):
    try:
        for file in files:
            doc = {
                "file": file['name'],
                "url": file['url'],
                "blob_name": file['blob_name'],
                "domain_name": file['domain'],
                "version_id": file['version_id'],
                "date_str": file['date_str'],
                "time_str": file['time_str'],
                "in_vector_store": file['in_vector_store'],
                "is_root_blob": file['is_root_blob']
            }  
            
            db[collectionName].update_many(
                {"file": file['name'], "in_vector_store": "yes"},
                {"$set": {"in_vector_store": "no"}}
            )

            db[collectionName].update_many(
                {"file": file['name'], "is_root_blob": "yes"},
                {"$set": {"is_root_blob": "no"}}
            )

            db[collectionName].update_one(
                {"version_id": file['version_id']},
                {"$set": doc},           
                upsert=True             
            )
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    
def update_movement_document(collectionName,fileName, versionId):
    try:    
        db[collectionName].update_many(
            {"file": fileName, "in_vector_store": "yes"},
            {"$set": {"in_vector_store": "no"}}
        )

        db[collectionName].update_one(
            {"version_id": versionId},
            {"$set": {"in_vector_store": "yes"} },           
            upsert=True             
        )
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def delete_document(collectionName, doc_id, isRootBlob, fileName):
    try:
        if(isRootBlob == "yes"):
            db[collectionName].delete_many(
                {"file": fileName}
            )
        db[collectionName].delete_one({"_id": ObjectId(doc_id)})
        return True
    except Exception as e:
        return False

def get_collections():
    try:
        collections = db.list_collection_names()
        return collections
    except Exception as e:
        return False

def get_documents(collectionName, domain_name):
    try:
        documents = list(db[collectionName].find({"domain_name": domain_name}))
        # Convert ObjectId to string
        for doc in documents:
            doc['_id'] = str(doc['_id'])
        return documents
    except Exception as e:
        return False

def get_chatlogs():
    try:
        chats_logs = list(chatlogs_db["chat-collections"].find())

        for chat in chats_logs:
            chat['_id'] = str(chat['_id'])

        return chats_logs
    except Exception as e:
        return False