from . import SerializerMixin, validates, re, db

class Book(db.Model, SerializerMixin):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(50), nullable=False)
    cover_photo = db.Column(db.String, nullable=False)
    page_count = db.Column(db.Integer, nullable=False)
    topic = db.Column(db.String, nullable=False)
    description = db.Column(db.String(5000), nullable=False)

    # Relationship
    book_stacks = db.relationship('BookStack', back_populates='book', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='book', cascade="all, delete-orphan")

    # Serialize
    serialize_rules=('-reviews.book', '-book_stacks',)

    # Representation
    def __repr__(self):
        return f""" 
            <Book {self.id}
                google_book_id: {self.google_book_id}
                title: {self.title}
                author: {self.author}
                />
        """

    # Validations
    @validates("title")
    def validate_title(self, _, title):
        if not isinstance(title, str):
            raise TypeError("Title must be a string.")
        elif not 2 <= len(title) <= 100:
            raise ValueError(f"Title must be between 2 and 100 characters.")
        return title
    
    @validates("author")
    def validate_author(self, _, author):
        if not isinstance(author, str):
            raise TypeError("Author must be a string.")
        elif not 2 <= len(author) <= 50:
            raise ValueError(f"Author must be between 2 and 50 characters.")
        return author
    
    @validates("cover_photo")
    def validate_cover_photo(self, _, cover_photo):
        required_prefix = "https://books.google.com/books/content?id="
        if not cover_photo.startswith(required_prefix):
            raise ValueError(f"Cover photo URL must start with {required_prefix}.")
        return cover_photo
    
    @validates("page_count")
    def validate_page_count(self, _, page_count):
        if not isinstance(page_count, int):
            raise TypeError("Page count must be an integer.")
        elif not 1 <= page_count <= 500:
            raise ValueError(f"Page count must be between 1 and 500.")
        return page_count
    
    topic_options=[
        "Adventure",
        "Bedtime",
        "Courage",
        "Creativity",
        "Curiosity",
        "Emotions",
        "Family",
        "Fantasy",
        "Friendship",
        "Fun",
        "Humor",
        "Identity",
        "Inspiration",
        "Kindness",
        "Mystery",
        "Perspective",
        "Self-acceptance"
    ]
    
    @validates("topic")
    def validate_topic(self, _, topic):  
        if not isinstance(topic, str):
            raise TypeError("Topic must be a string.")
        elif topic not in self.topic_options:
            raise ValueError("Topic must be one of the predefined values.")
        else:
            return topic

    @validates("description")
    def validate_description(self, _, description):
        if not isinstance(description, str):
            raise TypeError("Description must be a string.")
        elif not 2 <= len(description) <= 5000:
            raise ValueError(f"Description must be between 2 and 5,000 characters.")
        return description