from . import SerializerMixin, validates, re, db
from .book import Book
from .stack import Stack

class BookStack(db.Model, SerializerMixin):
    __tablename__ = 'book_stacks'

    book_id = db.Column(db.Integer, db.ForeignKey('stacks.id'), primary_key = True)
    stack_id = db.Column(db.Integer, db.ForeignKey('stacks.id'), primary_key = True)

    # Relationship
    book = db.relationship('Book', back_populates='book_stacks')
    stack = db.relationship('Stack', back_populates='book_stacks')

    # Serialize
    serialize_rules=('-book.book_stacks', '-stack.book_stacks',)

    # Representation
    def __repr__(self):
        return f""" 
            <BookStack
                book_id: {self.book_id}
                stack_id: {self.stack_id}
                />
        """
    
    # Validations
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
    
    @validates("stack_id")
    def validate_stack_id(self, _, stack_id):
        if not isinstance(stack_id, int):
            raise TypeError("Stack ids must be integers.")
        elif stack_id < 1:
            raise ValueError(f"{stack_id} has to be a positive integer.")
        elif not db.session.get(Stack, stack_id):
            raise ValueError(
                f"{stack_id} has to correspond to an existing stack."
            )
        return stack_id