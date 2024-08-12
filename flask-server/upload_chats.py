from pymongo import MongoClient
import json

connection_string = 'mongodb://chathistory-storage:VCITIePhEaJ8qhpg780cvpMmiU4n26kvG8RhVo2vAW6L1guPrDYBaZHvU5PW1SSmotHdi5desdliACDbrmja8g==@chathistory-storage.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@chathistory-storage@&tlsAllowInvalidCertificates=true'

database_name = "chathistory-storage"
collection_name = "chat-collections"

client = MongoClient(connection_string)
database = client[database_name]
collection = database[collection_name]

with open('sample_chat_data.json') as file:
    data = json.load(file)

# Insert data into the collection
if isinstance(data, list):
    collection.insert_many(data)
else:
    collection.insert_one(data)

print("Data imported successfully.")