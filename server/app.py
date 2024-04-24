#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request
from flask_restful import Resource
from werkzeug.exceptions import NotFound

# Local imports
from config import app, db, api
# Add your model imports
from models.book_stack import BookStack
from models.book import Book
from models.review import Review
from models.stack import Stack
from models.user import User


# General Route Concerns

@app.errorhandler(NotFound)
def not_found(error):
    return {"error": error.description}, 404

# API Routes

@app.route('/')
def index():
    return '<h1>Project Server</h1>'


if __name__ == '__main__':
    app.run(port=5555, debug=True)

