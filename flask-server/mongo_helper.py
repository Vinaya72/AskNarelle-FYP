from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime, timedelta
import calendar



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


def upload_course(course_name, username):
    try:
        doc = {
           "course_name": course_name,
           "user": username
        }
        
        db["courses"].update_one(
                {"course_name": doc["course_name"]},
                {"$set": doc},           
                upsert=True             
            )
        new_db = client[course_name]
        new_db.create_collection("conversations")
        new_db.create_collection("tickets")
        return True
    except Exception as e:
        print(e)
        return False

def delete_all_course_documents(course_name):
    try:
        db["uploaded_files"].delete_many(
            {"course_name": course_name}
        )
        db["courses"].delete_one({
            "course_name": course_name
        })
        return True
    except Exception as e:
        return False
    
def delete_domain_docs(course_name, domain_name):
    try:
        db["uploaded_files"].delete_many(
            {"course_name": course_name, "domain": domain_name}
        )
        return True
     
    except Exception as e:
        return False
    
def upload_domain(domain_name, course_name):
    print("course_name", course_name)
    try:
        doc = {
            "course_name": course_name,
            "domain": domain_name,
            "name": 'null',
            "url": 'null',
            "blob_name": 'null',
            "version_id": 'null',
            "date_str": 'null',
            "time_str": 'null',
            "in_vector_store": 'null',
            "is_root_blob": 'null',
        }  
        db["uploaded_files"].update_one(
            {"domain": domain_name, "name": 'null', "course_name": course_name},
            {"$set": doc},           
            upsert=True             
        )
        print("uploaded successfully")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
        

    
def create_document(files):
    try:
        for file in files:
            
            db["uploaded_files"].update_many(
                {"name": file['name'], "in_vector_store": "yes"},
                {"$set": {"in_vector_store": "no"}}
            )

            db["uploaded_files"].update_many(
                {"name": file['name'], "is_root_blob": "yes"},
                {"$set": {"is_root_blob": "no"}}
            )

            db["uploaded_files"].update_one(
                {"version_id": file['version_id']},
                {"$set": file},           
                upsert=True             
            )
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False
    
def update_movement_document(collectionName,fileName, versionId):
    try:    
        db["uploaded_files"].update_many(
            {"name": fileName, "in_vector_store": "yes"},
            {"$set": {"in_vector_store": "no"}}
        )

        db["uploaded_files"].update_one(
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
            db["uploaded_files"].delete_many(
                {"name": fileName}
            )
        db["uploaded_files"].delete_one({"_id": ObjectId(doc_id)})
        return True
    except Exception as e:
        return False
    

def get_collections():
    try:
        collections = db.list_collection_names()
        return collections
    except Exception as e:
        return False

def list_courses(username):
    courses_list = []
    try:
        documents = list(db["courses"].find({"user": username}))
        # Convert ObjectId to string
        for doc in documents:
            doc['_id'] = str(doc['_id'])   
            courses_list.append(doc['course_name'])
        return courses_list
    except Exception as e:
        return False
    
def get_domain_files(username,course_name):
    domains_list = []
    try:
        documents = list(db["courses"].find({"course_name": course_name}))

        if(len(documents) > 0):
            documents = list(db["courses"].find({"course_name": course_name, "user": username}))

            if(len(documents) > 0):
                documents = list(db["uploaded_files"].find({"name": "null","course_name": course_name}))
                for doc in documents:
                    doc['_id'] = str(doc['_id'])   
                    domains_list.append(doc['domain'])
                return domains_list
            else:
                return "403"
        else:
            return "404"
        
    except Exception as e:
        return "False"
    
def get_documents(username,course_name, domain_name):
    try:
        documents = list(db["courses"].find({"course_name": course_name}))

        if(len(documents) > 0):
            documents = list(db["courses"].find({"course_name": course_name, "user": username}))

            if(len(documents) > 0):    
                documents = list(db["uploaded_files"].find({"domain": domain_name, "course_name": course_name}))    

                if(len(documents) > 0):
                    documents = list(db["uploaded_files"].find({"domain": domain_name, "course_name": course_name, "name": {"$ne": "null"}}))
                    # Convert ObjectId to string
                    for doc in documents:
                        doc['_id'] = str(doc['_id'])   
                    return documents
                else:
                    return "404"

            else:
                return "403"
        else:
            return "404"

    except Exception as e:
        return "False"

def get_chatlogs():
    try:
        chats_logs = list(chatlogs_db["chat-collections"].find())

        for chat in chats_logs:
            chat['_id'] = str(chat['_id'])

        return chats_logs
    except Exception as e:
        print(e)
        return False

def get_course_files_count(course_name):
    count = 0
    try:
        documents = list(db["uploaded_files"].find({"course_name": course_name, "name": {"$ne": "null"}}))
        # Convert ObjectId to string
        for doc in documents:
            count = count + 1
        return count
    except Exception as e:
        return "False"
    
def get_domain_files_count(course_name, domain_name):
    count = 0
    try:
        documents = list(db["uploaded_files"].find({"course_name": course_name, "domain": domain_name, "name": {"$ne": "null"}}))
        # Convert ObjectId to string
        for doc in documents:
            count = count + 1
        return count
    except Exception as e:
        return "False"
    
def get_users_count(username):
    try:
        users = 0
        user_courses_docs = list(db["courses"].find({"user": username }))
        for doc in user_courses_docs: 
            course_db = client[doc["course_name"]]  
            unique_users = course_db["conversations"].distinct("user")
            users = users + len(unique_users)
        
        return users
    except Exception as e:
        return "False"


def get_queries_count(username):
    try:
        queries_count = 0
        user_course_queries = list(db["courses"].find({"user": username }))
        for doc in user_course_queries:
            course_db = client[doc["course_name"]]
            course_queries = list(course_db["conversations"].find({"messages.role":  "user"}))
            queries_count = queries_count + len(course_queries)
        return  queries_count
    except Exception as e:
        return "False"
    
def get_queries_by_month(username):
    now = datetime.now()
    start_date = now - timedelta(days=365)

    start_date = start_date.replace(day=1)
    end_date = now.replace(day=1)

    months = []
    counts = []
    courses_to_include = []
    aggregated_result = {}

    try:
        user_courses = list(db["courses"].find({"user": username }))
        for doc in user_courses:
            courses_to_include.append(doc["course_name"])

        pipeline = [
            {
               "$unwind": "$messages"
             },
             {
                "$match": {
                    "messages.role": "user"
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": { "$year": { "$toDate": { "$multiply": ["$messages.recorded_on.timestamp", 1000] } } },
                        "month": { "$month": { "$toDate": { "$multiply": ["$messages.recorded_on.timestamp", 1000] } } }
                    },
                    "count": { "$sum": 1 }
                }
            },
            {
                "$sort": { "_id.year": 1, "_id.month": 1 }
            }
        ]
        
        for course in courses_to_include:
            course_db = client[course]
            course_result = list(course_db["conversations"].aggregate(pipeline))
   
            for entry in course_result:
                year = entry["_id"]["year"]
                month = entry["_id"]["month"]
                count = entry["count"]
                month_year = (year, month)

                if month_year in aggregated_result:
                    aggregated_result[month_year] += count
                else:
                    aggregated_result[month_year] = count

        for (year, month), count in sorted(aggregated_result.items()):
            month_name = calendar.month_name[month]
            months.append(f"{month_name} {year}")
            counts.append(count)

        output = {
            "months": months,
            "counts": counts
        }
        return output

    except Exception as e:
        print(e)
        return "False"
    
def get_queries_by_course(username):
     
    courses_to_include = []
    courses = []
    counts = []
    try:
        user_courses = list(db["courses"].find({"user": username }))
        for doc in user_courses:
            courses_to_include.append(doc["course_name"])
        
        pipeline = [
            {
               "$unwind": "$messages"
             },
             {
                "$match": {
                    "messages.role": "user"
                }
            },
            {
                "$group": {
                    "_id": None,  
                    "count": { "$sum": 1 }  
                }
            }
        ]

        for course in courses_to_include:
            course_db = client[course]
            course_result = list(course_db["conversations"].aggregate(pipeline))

            if course_result:
                courses.append(course)
                counts.append(course_result[0]["count"])
        output = {
            "courses": courses,
            "counts": counts
        }
        return output

    except Exception as e:
        print(e)
        return "False"

def get_user_sentiments(username):
    courses_to_include = []
    counts = []
    sentiments = []
    aggregated_sentiments = {}

    try:
        user_courses = list(db["courses"].find({"user": username }))
        for doc in user_courses:
            courses_to_include.append(doc["course_name"])
        
   
        pipeline = [
            {
                "$unwind": "$messages"
            },
            {
                "$match": {
                    "messages.role": "user" 
                }
            },
            {
                "$group": {
                    "_id": "$messages.sentiment", 
                    "count": { "$sum": 1 }  
                }
            }
        ]

        for course in courses_to_include:
            course_db = client[course]  
            course_result = list(course_db["conversations"].aggregate(pipeline)) 
            
            for entry in course_result:
                sentiment = entry["_id"]
                count = entry["count"]

                if sentiment in aggregated_sentiments:
                    aggregated_sentiments[sentiment] += count
                else:
                    aggregated_sentiments[sentiment] = count
                
        for sentiment, count in sorted(aggregated_sentiments.items()):
            sentiments.append(sentiment)
            counts.append(count)

        output = {
            "sentiments": sentiments,
            "counts": counts
        }
        return output
    
    except Exception as e:
        print(e)
        return "False"

    
def get_user_emotions(username):

    courses_to_include = []
    emotions = []
    counts = []
    aggregated_emotions = {}
    try:
        user_courses = list(db["courses"].find({"user": username }))
        for doc in user_courses:
            courses_to_include.append(doc["course_name"])
        
        pipeline = [
            {
                "$unwind": "$messages"
            },
            {
                "$match": {
                    "messages.role": "user" 
                }
            },
            {
                "$group": {
                    "_id": "$messages.emotion", 
                    "count": { "$sum": 1 }  
                }
            }
        ]

        for course in courses_to_include:
            course_db = client[course]  
            course_result = list(course_db["conversations"].aggregate(pipeline)) 
            
            for entry in course_result:
                emotion = entry["_id"]
                count = entry["count"]

                if emotion in aggregated_emotions:
                    aggregated_emotions[emotion] += count
                else:
                    aggregated_emotions[emotion] = count
                
        for emotion, count in sorted(aggregated_emotions.items()):
            emotions.append(emotion)
            counts.append(count)

        output = {
            "emotions": emotions,
            "counts": counts
        }
        return output

    except Exception as e:
        print(e)
        return "False"

 




   
    
