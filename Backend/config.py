import os
from flask_cors import CORS
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Use fixed absolute paths for database and frontend folders
# Get the base directory (i.e., the folder where config.py lives)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

db_path = os.path.join(BASE_DIR, 'Database', 'Collection.db')
static_folder = os.path.join(BASE_DIR, '..', 'Frontend', 'static')
template_folder = os.path.join(BASE_DIR, '..', 'Frontend', 'templates')

print(f"Using database path: {db_path}")
secret_key = os.environ.get('FLASK_SECRET_KEY', 'Ganesh70')  # Fallback to a default secret key

# Initialize the Flask application
app = Flask(__name__,
            static_folder=static_folder,
            template_folder=template_folder)
app.secret_key = secret_key  # Set the secret key for session management
CORS(app)  # Enable CORS for all routes

# Configure the database URI
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking

# Initialize SQLAlchemy
db = SQLAlchemy(app)