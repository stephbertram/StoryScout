#!/usr/bin/env python3

# Remote library imports
from flask import request, session
from flask_restful import Resource
from werkzeug.exceptions import NotFound
from functools import wraps

# Local imports
from config import app, db, api
# Add your model imports
from models.book_stack import BookStack
from models.book import Book
from models.review import Review
from models.stack import Stack
from models.user import User


# Error Handling
@app.errorhandler(NotFound)
def not_found(error):
    return {"error": error.description}, 404


# Route Protection
# @app.before_request
# def before_request():
#     #! First refactor when inserting crew routes BUT not very DRY right?
#     # if request.endpoint == "productionbyid":
#     #     id = request.view_args.get("id")
#     #     prod = db.session.get(Production, id)
#     #     g.prod = prod
#     # elif request.endpoint == "crewmemberbyid":
#     #     id = request.view_args.get("id")
#     #     crew = db.session.get(CrewMember, id)
#     #     g.crew = crew
#     #! Better Approach
#     path_dict = {"productionbyid": Production, "crewmemberbyid": CrewMember}
#     if request.endpoint in path_dict:
#         id = request.view_args.get("id")
#         record = db.session.get(path_dict.get(request.endpoint), id)
#         key_name = "prod" if request.endpoint == "productionbyid" else "crew"
#         setattr(g, key_name, record)

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


class BookById(Resource):
    def get(self, id):
        try: 
            if book := db.session.get(Book, id):
                return book.to_dict(), 200
            else:
                return {"Error": "Book not found."}, 404
        except Exception as e:
            return {"Error": str(e)}, 400
api.add_resource(BookById, "/books/<int:id>")


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


if __name__ == '__main__':
    app.run(port=5555, debug=True)

