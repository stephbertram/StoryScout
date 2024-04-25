from . import SerializerMixin, validates, re, db
from models.user import User

class Stack(db.Model, SerializerMixin):
    __tablename__ = 'stacks'

    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    # Relationship
    book_stacks = db.relationship('BookStack', back_populates='stack', cascade="all, delete-orphan")
    user = db.relationship('User', back_populates='stacks')

    # Serialize
    serialize_rules=('-book_stacks.stacks', '-user.stacks',)

    # Representation
    def __repr__(self):
        return f""" 
            <Stack {self.id}
                name: {self.name}
                user_id: {self.user_id}
                />
        """
    
    # Validations
    @validates("name")
    def validate_name(self, _, name):
        if not isinstance(name, str):
            raise TypeError("Name must be a string.")
        elif not 2 <= len(name) <= 50:
            raise ValueError(f"Name must be between 2 and 50 characters.")
        return name
    
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