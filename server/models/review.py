from . import SerializerMixin, validates, re, db
from models.book import Book
from models.user import User

class Review(db.Model, SerializerMixin):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key = True)
    rating = db.Column(db.Integer)
    review = db.Column(db.String)
    rec_age = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationship
    book = db.relationship('Book', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')

    # Serialize
    serialize_rules=('-book.reviews', '-user.reviews',)

    # Representation
    def __repr__(self):
        return f""" 
            <Review {self.id}
                rating: {self.rating}
                review: {self.review}
                rec_age: {self.rec_age}
                book_id: {self.book_id}
                user_id: {self.user_id}
                />
        """

    # Validations
    @validates("rating")
    def validate_rating(self, _, rating):
        if not isinstance(rating, int):
            raise TypeError("Rating must be an integer.")
        elif not 1 <= rating <= 5:
            raise ValueError(f"Rating must be between 1(lowest) and 5(highest).")
        return rating
    
    @validates("review")
    def validate_review(self, _, review):
        if not isinstance(review, str):
            raise TypeError("Review must be a string.")
        elif not 5 <= len(review) <= 5000:
            raise ValueError(f"Review must be between 5 and 5,000 characters.")
        return review

    age_options=[
        "Board Books (Ages 0-3)", 
        "Picture Books (Ages 3-6)",  
        "Early Reader Books (Ages 5-7)", 
        "Chapter Books (Ages 7-10)"
        ]
    
    @validates("rec_age")
    def validate_rec_age(self, _, rec_age):  
        if not isinstance(rec_age, str):
            raise TypeError("Age recommendation must be a string.")
        elif rec_age not in self.age_options:
            raise ValueError("Age recommendation must be one of the predefined values.")
        else:
            return rec_age
        
    @validates("book_id")
    def validate_book_id(self, _, book_id):
        if not isinstance(book_id, int):
            raise TypeError("Book ids must be integers.")
        elif book_id < 1:
            raise ValueError(f"{book_id} has to be a positive integer.")
        elif not db.session.get(Book, book_id):
            raise ValueError(
                f"{book_id} has to correspond to an existing book."
            )
        return book_id
    
    @validates("user_id")
    def validate_user_id(self, _, user_id):
        if not isinstance(user_id, int):
            raise TypeError("User ids must be integers.")
        elif user_id < 1:
            raise ValueError(f"{user_id} has to be a positive integer.")
        elif not db.session.get(User, user_id):
            raise ValueError(
                f"{user_id} has to correspond to an existing user."
            )
        return user_id