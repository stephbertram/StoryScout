from . import SerializerMixin, validates, re, db
from sqlalchemy.ext.hybrid import hybrid_property
from config import flask_bcrypt

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    profile_image = db.Column(db.String)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # Relationship
    stacks = db.relationship('Stack', back_populates='user', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='user', cascade="all, delete-orphan")

    # Serialize
    serialize_rules=('-stacks.user', '-reviews.user',)

    # Representation
    def __repr__(self):
        return f""" 
            <User {self.id}
                username: {self.username}
                email: {self.email}
                />
        """
    
    # Validations
    @validates("username")
    def validate_username(self, _, username):
        if not isinstance(username, str):
            raise TypeError("Username must be a string.")
        elif not 3 <= len(username) <= 20:
            raise ValueError(f"Username must be between 3 and 20 characters.")
        return username
    
    @validates("email")
    def validate_email(self, _, email):
        if not isinstance(email, str):
            raise TypeError("Email must be a string.")
        elif not 5 <= len(email) <= 40:
            raise ValueError(f"Email must be between 5 and 40 characters.")
        email_regex = r"[^@]+@[^@]+\.[^@]+" 
        if not re.match(email_regex, email):
            raise ValueError("Invalid email format.")
        return email


    @hybrid_property
    def password_hash(self):
        raise AttributeError('Access to password is restricted')
    
    @password_hash.setter
    def password_hash(self, new_password):
        if not len(new_password) >= 8:
            raise ValueError('Password must be 8 or more characters')
        elif not re.search(r"[$&+,:;=?@#|'<>.-^*()%!]",new_password):
            raise ValueError('Password must contain special characters')
        elif not re.search(r"[A-Z]",new_password):
            raise ValueError('Password must contain at least one capital letter')
        elif not re.search(r"[a-z]",new_password):
            raise ValueError('Password must contain at least one lowercase letter')
        elif not re.search(r"[0-9]",new_password):
            raise ValueError('Password must contain at least one number')
        else:
            hashed_password = flask_bcrypt.generate_password_hash(new_password).decode('utf-8')
            self._password_hash = hashed_password

    def authenticate(self, password_to_check):
        return flask_bcrypt.check_password_hash(self._password_hash, password_to_check)