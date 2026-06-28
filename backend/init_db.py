from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from datetime import datetime

def initialize_database():
    print("🚀 Starting database initialization...")

    try:
        client = MongoClient('mongodb://localhost:27017/')
        db = client['cinescopeDB']
    except Exception as e:
        print("❌ Failed to connect to MongoDB:", e)
        return

    # Show existing collections before setup
    print("📦 Existing collections:", db.list_collection_names())

    # Create collections if they don't exist
    collections = ['users', 'movies', 'people']
    for col in collections:
        if col not in db.list_collection_names():
            db.create_collection(col)
            db[col].insert_one({"created": True})
            print(f"✅ Created collection: '{col}' with dummy document")

    # Create admin user if not exists
    if not db.users.find_one({"email": "admin@cinescope.com"}):
        admin_user = {
            "email": "admin@cinescope.com",
            "password": generate_password_hash("Admin@123"),
            "name": "Admin",
            "profile_emoji": "👑",
            "preferred_genres": [],
            "is_child": False,
            "is_admin": True,
            "created_at": datetime.utcnow(),
            "watchlist": [],
            "profiles": []  # Admin doesn't need profiles
        }
        db.users.insert_one(admin_user)
        print("✅ Admin user created")
    else:
        print("ℹ️ Admin user already exists")

    # Migrate existing users to have profiles
    migrated = 0
    for user in db.users.find({"profiles": {"$exists": False}}):
        if not user.get('is_admin', False):
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "profiles": [{
                        "name": user["name"],
                        "profile_emoji": user.get("profile_emoji", "👤"),
                        "is_child": user.get("is_child", False),
                        "is_default": True,
                        "created_at": datetime.utcnow()
                    }]
                }}
            )
            migrated += 1

    if migrated > 0:
        print(f"🔄 Migrated {migrated} user(s) to include profiles")
    else:
        print("✅ No user profile migration needed")

    # Show current users
    print("\n👥 Users in database:")
    for user in db.users.find({}, {"email": 1, "_id": 0}):
        print(f" - {user['email']}")

    print("\n✅ Database initialized successfully")


# Run the function when script is executed directly
if __name__ == "__main__":
    initialize_database()
