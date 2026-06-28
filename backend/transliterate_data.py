import re
from pymongo import MongoClient

def normalize_title(title):
    title = title.strip().lower()
    title = re.sub(r'\s+', ' ', title)
    return title

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['cinescope']  # Change if your DB name differs

movies_collection = db['movies2']
people_collection = db['people2']

# Build transliteration map from movies2 collection
print("🔄 Building transliteration map from movie titles...")

transliteration_map = {}
movies_cursor = movies_collection.find({'english_title': {'$exists': True, '$ne': None}},
                                       {'title': 1, 'english_title': 1})

for movie in movies_cursor:
    mal_title = movie.get('title', '')
    eng_title = movie.get('english_title', '')
    if mal_title and eng_title:
        transliteration_map[mal_title] = eng_title

print(f"✅ Transliteration map built for {len(transliteration_map)} movies.")

# Normalize transliteration map keys
normalized_map = {normalize_title(k): v for k, v in transliteration_map.items()}

# Update people2 collection's characters.movie fields
print("🔄 Updating people2 collection with transliterated movie titles...")

updated_count = 0
people_cursor = people_collection.find({})

for person in people_cursor:
    updated = False
    characters = person.get('characters', [])
    for char in characters:
        mal_title = char.get('movie', '')
        norm_title = normalize_title(mal_title)
        if norm_title in normalized_map:
            new_title = normalized_map[norm_title]
            if char['movie'] != new_title:
                char['movie'] = new_title
                updated = True

    if updated:
        people_collection.update_one({'_id': person['_id']}, {'$set': {'characters': characters}})
        updated_count += 1

print(f"✅ Done. Total people documents updated: {updated_count}")
