from pymongo import MongoClient
import json

# MongoDB Connection
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "cinescopeDB"

try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    movies_collection = db["movies"]
    people_collection = db["people"]
    print("✅ Successfully connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    exit()

def load_json_data(json_file, collection_name):
    try:
        with open(json_file, 'r', encoding='utf-8') as file:
            data = json.load(file)
            
            if isinstance(data, list):
                # For array JSON files
                inserted_count = 0
                for item in data:
                    if collection_name == "movies":
                        if not movies_collection.find_one({"id": item["id"]}):
                            movies_collection.insert_one(item)
                            inserted_count += 1
                    elif collection_name == "people":
                        if not people_collection.find_one({"id": item["id"]}):
                            people_collection.insert_one(item)
                            inserted_count += 1
                print(f"✅ {inserted_count} new items added to {collection_name}")
            else:
                # For single object JSON files
                if collection_name == "movies":
                    if not movies_collection.find_one({"id": data["id"]}):
                        movies_collection.insert_one(data)
                elif collection_name == "people":
                    if not people_collection.find_one({"id": data["id"]}):
                        people_collection.insert_one(data)
                print(f"✅ 1 new item added to {collection_name}")
                
    except FileNotFoundError:
        print(f"❌ Error: File '{json_file}' not found.")
    except Exception as e:
        print(f"❌ Error processing data: {e}")

if __name__ == "__main__":
    # Load movies data
    load_json_data("movies.json", "movies")
    
    # Load people data
    load_json_data("people.json", "people")