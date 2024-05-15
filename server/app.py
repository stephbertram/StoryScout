#!/usr/bin/env python3

import os

# #Signal Handling
# import signal
# import sys

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
from dotenv import load_dotenv


# Local imports
from config import app, db, api
# Add your model imports
from models.book_stack import BookStack
from models.book import Book
from models.review import Review
from models.stack import Stack
from models.user import User

#Cloudinary
load_dotenv()
config = cloudinary.config(secure=True)

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
    @login_required
    def get(self):
        try:
            topic = request.args.get('topic')
            rating = request.args.get('rating')
            rec_age = request.args.get('rec_age')
            
            query = Book.query
            
            if topic:
                query = query.filter(Book.topic == topic)
            if rating or rec_age:
                subquery = db.session.query(Review.book_id).group_by(Review.book_id)
                if rating:
                    subquery = subquery.having(db.func.avg(Review.rating) >= int(rating))
                if rec_age:
                    subquery = subquery.filter(Review.rec_age == rec_age)
                query = query.filter(Book.id.in_(subquery))
            
            books = query.all()
            filtered_books = [book.to_dict() for book in books]
            return filtered_books, 200
        except Exception as e:
            return {"Error": str(e)}, 400
api.add_resource(AllBooks, "/books")


class BookById(Resource):
    @login_required
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
    @login_required
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
    @login_required
    def get(self, id):
        try: 
            if user := db.session.get(User, id):
                return user.to_dict(), 200
            else:
                return {"Error": "User not found."}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
    
    @login_required
    def patch(self, id):
        if user := db.session.get(User, id):
            try:
                file = request.files['profile_image']
                if file:
                    response = cloudinary.uploader.upload(
                        file,
                        upload_preset="StoryScout",
                        unique_filename=True, 
                        overwrite=True,
                        eager=[{"width": 500, "crop": "fill"}]
                    )
                    image_url = response['eager'][0]['secure_url']
                    user.profile_image=image_url

                data = request.form
                for attr, value in data.items():
                    if attr == '_password_hash':
                        user.password_hash = value
                    else:
                        setattr(user, attr, value)
                db.session.commit()
                return user.to_dict(), 202

            except Exception as e:
                return {"Error": [str(e)]}, 400
        else:
            return {"Error": "User not found"}, 404

    @login_required    
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
    @login_required
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


class BookToStack(Resource):
    @login_required
    def post(self, user_id, book_id):
        try:
            user = User.query.get(user_id)
            book = Book.query.get(book_id)
            
            if not user or not book:
                return {"Error": "Stack not found for user."}, 404

            # First stack is default stack
            stack = user.stacks[0] if user.stacks else None
            if not stack:
                return {"Error": "Stack not found for user."}, 404

            # Create a new BookStack entry
            new_book_stack = BookStack(book_id=book.id, stack_id=stack.id)
            db.session.add(new_book_stack)
            db.session.commit()
            
            return new_book_stack.to_dict(), 201

        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(BookToStack, '/<int:user_id>/add_to_stack/<int:book_id>')


class RemoveBookFromStack(Resource):
    @login_required
    def delete(self, book_id):
        try:
            user = User.query.get(session['user_id']) # use session user id
            if not user:
                return {"Error": "User not found."}, 404

            found_book_stack = None
            for stack in user.stacks:
                for book_stack in stack.book_stacks:
                    if book_stack.book_id == book_id:
                        found_book_stack = book_stack
                        break
                if found_book_stack:
                    break
            
            # If the book is not found in any stack, return an error
            if not found_book_stack:
                return {"Error": "Book not found in stack."}, 404

            # Remove the book from the stack
            db.session.delete(found_book_stack)
            db.session.commit()

            return {"Success": "Book removed from stack"}, 200
        except Exception as e:
            db.session.rollback()
            return {"Error": str(e)}, 400
api.add_resource(RemoveBookFromStack, '/user/remove_book/<int:book_id>')


# User Management

# Signup
class SignUp(Resource):
    def post(self):
        file = request.files['profile_image']
        if file:
            try:
                response = cloudinary.uploader.upload(
                    file,
                    upload_preset="StoryScout",
                    unique_filename=True, 
                    overwrite=True,
                    eager=[{"width": 500, "crop": "fill"}]
                )
                image_url = response['eager'][0]['secure_url']
            except Exception as e:
                return {"Error": str(e)}, 400 

        data = request.form
        
        try:
            new_user = User(
                username=data['username'],
                email=data['email'],
                # _password_hash=data['_password_hash'], 
                profile_image=image_url if file and image_url else None
            )
            new_user.password_hash = data['_password_hash']
            
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
            # import ipdb; ipdb.set_trace()
            data = request.form
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


if __name__ == '__main__':
    app.run(port=5555, debug=True)


