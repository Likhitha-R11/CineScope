import requests
import os
import json
from pymongo import MongoClient
from tqdm import tqdm
from dotenv import load_dotenv
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from indic_transliteration.sanscript import transliterate
from indic_transliteration import sanscript


def load_last_page():
    if os.path.exists("progress.json"):
        with open("progress.json", "r") as f:
            return json.load(f).get("last_page", 1)
    return 1

def save_last_page(page):
    with open("progress.json", "w") as f:
        json.dump({"last_page": page}, f)

# Load API key
load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY") or "c01cb989be7c0b55a3d3bc4c03968692"
if not TMDB_API_KEY:
    raise ValueError("TMDB_API_KEY not found.")

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["cinescopeDB"]
movies_col = db["movies2"]
people_col = db["people2"]

# Request setup
session = requests.Session()
retries = Retry(total=10, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
session.mount('https://', HTTPAdapter(max_retries=retries))

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p/original"
PROGRESS_FILE = "fetch_progress_malayalam.json"

def load_progress():
    try:
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    except:
        return {'last_page': 0, 'processed_ids': []}

def save_progress(page, processed_ids):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump({'last_page': page, 'processed_ids': list(processed_ids)}, f)

def cleanup_progress_file():
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)

def fetch_popular_movies(page):
    url = f"{BASE_URL}/discover/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "sort_by": "popularity.desc",
        "page": page,
        "region": "IN",
        "with_original_language": "ml",
        "include_adult": False,
    }
    try:
        response = session.get(url, params=params)
        response.raise_for_status()
        return response.json().get("results", [])
    except Exception as e:
        print(f"Failed to fetch page {page}: {e}")
        return []

def get_movie_details(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}"
    params = {"api_key": TMDB_API_KEY, "append_to_response": "credits,videos", "language": "ml-IN"}
    try:
        response = session.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to fetch movie {movie_id}: {e}")
        return {}

def get_english_title(movie_id):
    url = f"{BASE_URL}/movie/{movie_id}/translations?api_key={TMDB_API_KEY}"
    try:
        response = session.get(url)
        if response.status_code == 200:
            for t in response.json().get("translations", []):
                if t["iso_639_1"] == "en" and "title" in t["data"]:
                    return t["data"]["title"]
    except Exception as e:
        print(f"Failed to get English title for {movie_id}: {e}")
    return None

def save_person(person, movie_title, role_name):
    if not person or not person.get("id"):
        return

    person_id = person["id"]

    try:
        url = f"{BASE_URL}/person/{person_id}"
        params = {"api_key": TMDB_API_KEY, "language": "ml-IN"}
        response = session.get(url, params=params)
        response.raise_for_status()
        details = response.json()
    except Exception as e:
        print(f"Failed to fetch person {person_id}: {e}")
        details = {}

    # If person already exists in MongoDB
def update_or_insert_person(person_id, person, movie_title, role_name, details):
    existing = people_col.find_one({"_id": person_id})
    character_entry = {"movie": movie_title, "name": role_name} if role_name else None

    if existing:
        update_ops = {}

        if movie_title:
            update_ops.setdefault("$addToSet", {}).setdefault("known_for", movie_title)

        if character_entry:
            update_ops.setdefault("$addToSet", {}).setdefault("characters", character_entry)

        if update_ops:
            people_col.update_one({"_id": person_id}, update_ops)

        return  # valid here inside function

    person_doc = {
        "_id": person_id,
        "id": person_id,
        "name": person.get("name"),
        "characters": [character_entry] if character_entry else [],
        "known_for": [movie_title] if movie_title else [],
        "profile_path": IMAGE_BASE + person["profile_path"] if person.get("profile_path") else None,
        "department": details.get("known_for_department"),
        "popularity": details.get("popularity"),
        "biography": details.get("biography"),
        "birthday": details.get("birthday"),
        "place_of_birth": details.get("place_of_birth")
    }
    people_col.insert_one(person_doc)

def save_movie(movie_data):
    if not movie_data or not movie_data.get("id"):
        return False

    if movies_col.find_one({"id": movie_data["id"]}):
        return False

    if movie_data.get("original_language") != "ml":
        return False

    credits = movie_data.get("credits", {})
    cast = credits.get("cast", [])[:10]
    crew = credits.get("crew", [])
    director = next((c for c in crew if c.get("job") == "Director"), None)

    cast_ids = []
    for person in cast:
        save_person(person, movie_data.get("title"), person.get("character"))
        cast_ids.append(person["id"])

    director_id = None
    if director:
        save_person(director, movie_data.get("title"), "Director")
        director_id = director["id"]

    trailer_url = None
    for video in movie_data.get("videos", {}).get("results", []):
        if video.get("site") == "YouTube" and video.get("type") == "Trailer":
            trailer_url = f"https://www.youtube.com/watch?v={video['key']}"
            break

    raw_title = movie_data.get("title", "")
    raw_original_title = movie_data.get("original_title", "")
    title = transliterate(raw_title, sanscript.MALAYALAM, sanscript.ITRANS) if raw_title else ""
    original_title = transliterate(raw_original_title, sanscript.MALAYALAM, sanscript.ITRANS) if raw_original_title else ""

    movie_doc = {
        "_id": movie_data["id"],
        "id": movie_data["id"],
        "title": title,
        "original_title": original_title,
        "release_year": movie_data.get("release_date", "")[:4],
        "runtime": movie_data.get("runtime"),
        "genres": [g["name"] for g in movie_data.get("genres", [])],
        "overview": movie_data.get("overview"),
        "poster_path": IMAGE_BASE + movie_data["poster_path"] if movie_data.get("poster_path") else None,
        "backdrop_path": IMAGE_BASE + movie_data["backdrop_path"] if movie_data.get("backdrop_path") else None,
        "vote_average": movie_data.get("vote_average"),
        "vote_count": movie_data.get("vote_count"),
        "trailer_url": trailer_url,
        "cast_ids": cast_ids,
        "director_id": director_id,
    }

    movies_col.insert_one(movie_doc)
    return True

import time
from tqdm import tqdm

def main(target=5000, max_retries=3):
    progress = load_progress()
    current_page = progress.get('last_page', 0) + 1
    processed_ids = set(progress.get('processed_ids', []))

    added_count = movies_col.count_documents({})
    print(f"Starting Malayalam movie fetch. Already in DB: {added_count}. Target: {target}.")

    while added_count < target:
        print(f"\nFetching page {current_page}...")

        # Retry logic for temporary failures or rate limiting
        retries = 0
        movies = []
        while retries < max_retries:
            movies = fetch_popular_movies(current_page)
            if movies:
                break
            retries += 1
            wait_time = 10 * (retries + 1)  # exponential backoff
            print(f"Retry {retries}/{max_retries} after waiting {wait_time}s (possible rate-limit or network error).")
            time.sleep(wait_time)

        if not movies:
            print(f"❌ Failed to fetch page {current_page} after {max_retries} retries. Stopping.")
            break

        for m in tqdm(movies, desc=f"Page {current_page}"):
            movie_id = m.get("id")
            if not movie_id or movie_id in processed_ids or movies_col.find_one({"id": movie_id}):
                continue

            movie_data = get_movie_details(movie_id)
            time.sleep(2)

            if save_movie(movie_data):
                added_count += 1
                processed_ids.add(movie_id)
                english_title = get_english_title(movie_id)
                print(f"✅ Added: {english_title or movie_data.get('title')} | Total: {added_count}")

            if added_count >= target:
                cleanup_progress_file()
                print(f"\n🎉 Done! Total movies fetched: {added_count}")
                return

        # ✅ Save progress once per page
        save_progress(current_page, processed_ids)

        current_page += 1
        time.sleep(2)  # Delay between pages to avoid rate limits

    cleanup_progress_file()



if __name__ == "__main__":
    main(target=5000)
