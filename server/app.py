#!/usr/bin/env python3

#Signal Handling
import signal
import sys

# Remote library imports
from flask import request, session, jsonify
from flask_restful import Resource
from werkzeug.exceptions import NotFound
from functools import wraps
from sqlalchemy.sql import func

# Cloudinary
import cloudinary
import cloudinary.uploader
import cloudinary.api
import logging
import os
# from cloudinary.utils import cloudinary_url
from dotenv import load_dotenv
load_dotenv()

# Local imports
from config import app, db, api
# Add your model imports
from models.book_stack import BookStack
from models.book import Book
from models.review import Review
from models.stack import Stack
from models.user import User

#Signal Handling
def shutdown(signum, frame):
    print("Shutting down from signal", signum)
    sys.exit(0)

# Error Handling
@app.errorhandler(NotFound)
def not_found(error):
    return {"error": error.description}, 404

# Route Protection
def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return {"Error": "Access Denied. Please log in."}, 422
        return func(*args, **kwargs)
    return decorated_function

# API Routes
class AllBooks(Resource):
    def get(self):
        try:
            all_books = [book.to_dict() for book in Book.query]
            return all_books, 200
        except Exception as e:
            return {"Error": str(e)}, 400
api.add_resource(AllBooks, "/books")



# class BookById(Resource):
#     def get(self, id):
#         try: 
#             if book := db.session.get(Book, id):
#                 return book.to_dict(), 200
#             else:
#                 return {"Error": "Book not found."}, 404
#         except Exception as e:
#             return {"Error": str(e)}, 400
# api.add_resource(BookById, "/books/<int:id>")


class BookById(Resource):
    def get(self, book_id):
        try:
            book = Book.query.filter_by(id=book_id).first()
            # book = db.session.get(Book, book_id)
            if book:
                # Calculate average rating
                average_rating = db.session.query(func.avg(Review.rating)).filter(Review.book_id == book_id).scalar()

                # Calculate the mode of rec_age
                rec_age_mode_query = db.session.query(
                    Review.rec_age,
                    func.count(Review.rec_age).label('age_count')
                ).filter(Review.book_id == book_id)\
                .group_by(Review.rec_age)\
                .order_by(db.desc('age_count'))\
                .first()

                rec_age_mode = rec_age_mode_query[0] if rec_age_mode_query else "Not available"

                # Fetch all reviews for this book
                reviews = db.session.query(Review.review).filter(Review.book_id == book_id).all()
                
                # Construct review data for JSON
                review_data = [{
                    'review': rev.review
                } for rev in reviews]

                return jsonify({
                    'id': book.id,
                    'title': book.title,
                    'author': book.author,
                    'cover_photo': book.cover_photo,
                    'page_count': book.page_count,
                    'topic': book.topic,
                    'description': book.description,
                    'average_rating': float(average_rating) if average_rating else 0,
                    'rec_age_mode': rec_age_mode,
                    'reviews': review_data
                })
            else:
                return {'Error': 'Book not found'}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
api.add_resource(BookById, "/books/<int:book_id>")


class BooksInUserStack(Resource):
    def get(self, user_id):
        try:
            if user := db.session.get(User, user_id):
                all_books = []
                for stack in user.stacks:
                    # Books proxy allows direct access to books in each stack
                    stack_books = [book.to_dict() for book in stack.books]
                    all_books.extend(stack_books)
                return stack_books, 200   
            else:
                return {"Error": "User not found."}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
api.add_resource(BooksInUserStack, "/users/<int:user_id>/stacks/books")



class UserById(Resource):
    def get(self, id):
        try: 
            if user := db.session.get(User, id):
                return user.to_dict(), 200
            else:
                return {"Error": "User not found."}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
    
    def patch(self, id):
        if user := db.session.get(User, id):
            try:
                data = request.json
                for attr, value in data.items():
                    setattr(user, attr, value)
                db.session.commit()
                return user.to_dict(), 202
            except Exception as e:
                return {"Error": [str(e)]}
        else:
            return {"Error": "User not found"}, 404
        
    def delete(self, id):
        try: 
            if user := db.session.get(User, id):
                db.session.delete(user)
                db.session.commit()
                return "", 204
            else:
                return {"Error": "User not found."}, 404
        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(UserById, "/users/<int:id>")


class Reviews(Resource):
    def post(self):
        try:
            data = request.json
            new_review = Review(**data)
            db.session.add(new_review)
            db.session.commit()
            return new_review.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"Errors": ["validation errors"]}, 400
api.add_resource(Reviews, "/reviews")


# User Management
class SignUp(Resource):
    def post(self):
        try:
            data = request.get_json()
            new_user = User(username=data.get('username'), email=data.get('email'))
            new_user.password_hash = data.get('_password_hash')
            db.session.add(new_user)
            db.session.commit()

            new_stack = Stack(name="Stack1", user_id=new_user.id)
            db.session.add(new_stack)
            db.session.commit()

            session['user_id'] = new_user.id
            return new_user.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(SignUp, '/signup')


class Login(Resource):
    def post(self):
        try:  
            data = request.get_json()
            user = User.query.filter_by(email=data.get("email")).first()
            if user and user.authenticate(data.get('_password_hash')):
                session["user_id"] = user.id
                return user.to_dict(), 200
            else:
                return {"Error": "Invalid Login"}, 422
        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(Login, '/login')


class Logout(Resource):
    def delete(self):
        try:
            if "user_id" in session:
                del session['user_id']
                return {}, 204
            else:
                return {"Error": "A User is not logged in."}, 404
        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(Logout, '/logout')


class CheckMe(Resource):
    def get(self):
        if "user_id" in session:
            user = db.session.get(User, session.get("user_id"))
            return user.to_dict(), 200
        else:
            return {"Error": "Please log in."}, 400       
api.add_resource(CheckMe, '/me')



#Cloudinary Profile Pic Storage
# @app.route("/upload", methods=['POST'])
# def upload_file():
#     app.logger.info('in upload route')

#     cloudinary.config(cloud_name = os.getenv('CLOUD_NAME'), api_key=os.getenv('API_KEY'), 
#         api_secret=os.getenv('API_SECRET'))
#     upload_result = None
#     if request.method == 'POST':
#         file_to_upload = request.files['file']
#         app.logger.info('%s file_to_upload', file_to_upload)
#         if file_to_upload:
#             upload_result = cloudinary.uploader.upload(file_to_upload)
#             app.logger.info(upload_result)
#             return jsonify(upload_result)
    
# class UploadFile(Resource): 
#     def post(self): 
#         file = request.files['file'] 
#         file.save('/uploads/' + file.filename) 
#         return 'File uploaded successfully!' 
# api.add_resource(UploadFile, '/upload')


if __name__ == '__main__':
    app.run(port=5555, debug=True)


