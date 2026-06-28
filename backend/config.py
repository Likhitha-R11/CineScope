import os
from datetime import timedelta

class Config:
    # MongoDB Configuration
    MONGO_URI = "mongodb://localhost:27017/"
    DB_NAME = "cinescopeDB"
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-very-secret-key-here'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Email Configuration (for password reset)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)
    
    # Security
    RESET_TOKEN_EXPIRATION = 3600  # 1 hour in seconds
    
    # Genres
    ALL_GENRES = [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
        'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
        'Thriller', 'War', 'Western'
    ]
