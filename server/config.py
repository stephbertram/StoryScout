# Standard library imports

# Remote library imports
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_bcrypt import Bcrypt
from flask_session import Session
from os import environ

# Deployment
import os
from dotenv import load_dotenv

load_dotenv()

# Local imports

# Instantiate app, set attributes
app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/build',
    template_folder='../client/build'
)

app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

app.secret_key = environ.get("SESSION_SECRET")
app.config["SESSION_TYPE"] = "sqlalchemy"
app.config["SESSION_SQLALCHEMY_TABLE"] = "sessions"

# App + SQLAlchemy Connection
db = SQLAlchemy(app)
app.config["SESSION_SQLALCHEMY"] = db
migrate = Migrate(app, db)

# Instantiate REST API
api = Api(app)

# Instantiate CORS
CORS(app)

# Bcrypt
flask_bcrypt = Bcrypt(app)

# Session
session = Session(app)
