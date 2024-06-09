from pymongo import MongoClient
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus
from bson import ObjectId



load_dotenv()

db_name = os.environ.get('DB_NAME')
key = os.environ.get('KEY')
cosmos_port = os.environ.get('COSMOS_PORT')

mongo_uri = os.environ.get('MONGO_URI')

client = MongoClient(mongo_uri)
db = client['file_database']


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
                "url": file['url']
            }           
            db[collectionName].update_one(
                {"file": file['name']},
                {"$set": doc},           
                upsert=True             
            )
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

def delete_document(collectionName, doc_id):
    try:
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

def get_documents(collectionName):
    try:
        documents = list(db[collectionName].find())
        # Convert ObjectId to string
        for doc in documents:
            doc['_id'] = str(doc['_id'])
        return documents
    except Exception as e:
        return False