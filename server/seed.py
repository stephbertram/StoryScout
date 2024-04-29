#!/usr/bin/env python3

# Standard library imports
import random
import csv
import sys

# Remote library imports
from faker import Faker
from rich import print

# Local imports
from config import db, app
from models.book_stack import BookStack
from models.book import Book
from models.review import Review
from models.stack import Stack
from models.user import User

fake = Faker()

def clear_tables():

    # BEGIN SEED
    print('\n[purple]------------- BEGIN ------------[/purple]')
    print('\n')

    # Clean Database
    print('[purple]Cleaning Database 🧽 [/purple]...\n')
    try:
        BookStack.query.delete()
        Review.query.delete()
        Book.query.delete()
        Stack.query.delete()
        User.query.delete()
        db.session.commit()
        print('\t[green]Cleaning Complete[/green] ✅\n')
    except Exception as e:
        print('[red]Cleaning Failed[/red] 😞', str(e), '\n')
        sys.exit(1)
    

# Create Books
def load_books(filename='books.csv'):
    print('[purple]Creating Books 🔮[/purple] ...\n')
    with open(filename, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header row
        for row in reader:
            try:
                title, author, cover_photo, page_count, topic, description = row
                book = Book(
                    title=title,
                    author=author,
                    cover_photo=cover_photo,
                    page_count=int(page_count),
                    topic=topic,
                    description=description
                )
                db.session.add(book)
            except ValueError as ve:
                print(f"Error processing row {row}: {ve}")
                print('\t[red]Book Creation Failed[/red] 😞\n')
                sys.exit(1)
        db.session.commit()
        print('\t[green]Books Created ✅[/green] \n')

# Create Users
def create_users():
    print('[purple]Creating Users[/purple] 🧑🏻‍💻 ...\n')
    try:
        users = []
        usernames = []
        emails = []
        for _ in range(20):
            username = fake.first_name()
            email = fake.email()
            while username in usernames or email in emails:
                username = fake.first_name()
                email = fake.email()
            usernames.append(username)
            emails.append(email)
            user = User(username=username, email=email)
            user.password_hash = user.username + 'Password1!'
            users.append(user)
        db.session.add_all(users)
        db.session.commit()
        print('\t[green]Users Created[/green] ✅ \n')
    except Exception as e:
        print('\t[red]User Creation Failed[/red] 😞 \n')
        print(e) 
        sys.exit(1)

# Create Review
def create_reviews():
    print('[purple]Creating Reviews[/purple] ✍🏽 ...\n')
    
    age_options= [
        "Board Books (Ages 0-3)",
        "Picture Books (Ages 3-6)",
        "Early Reader Books (Ages 5-7)",
        "Chapter Books (Ages 7-10)"
    ]
    
    try:
        for _ in range(300):
            new_review = Review(
                rating=random.randint(1,5),
                review=fake.paragraph(), 
                rec_age=random.choice(age_options),
                user_id=random.randint(1,20), 
                book_id=random.randint(1,64) 
                )
            db.session.add(new_review)
        db.session.commit()
        print('\t[green]Review Created ✅[/green]\n')
    except Exception as e:
        print('\t[red]Review Creation Failed[/red] 😞 \n')
        print(e)
        sys.exit(1)

def create_stacks():
    print('[purple]Creating Stacks[/purple] 📚 ...\n')
    try:
        users = User.query.all()
        stacks = []
        for user in users:
            # Create a stack for each user
            stack = Stack(name='Stack1', user_id=user.id)
            stacks.append(stack)
        db.session.add_all(stacks)
        db.session.commit()
        print('\t[green]Stacks Created for each user ✅[/green] \n')
    except Exception as e:
        print('\t[red]Stack Creation Failed[/red] 😞 \n')
        print(e)
        sys.exit(1)

def create_book_stacks():
    print('[purple]Creating Book Stacks[/purple] 📚📚 ...\n')
    try:
        book_stacks = []
        stack_ids = list(range(1, 21)) + random.choices(range(1, 21), k=10)  # 20 guaranteed + 10 random
        for _ in range(30): 
            stack_id = stack_ids.pop(0)  # Pop ensures no reuse in the first 20
            book_id = random.randint(1, 64) 
            book_stack = BookStack(book_id=book_id, stack_id=stack_id)
            book_stacks.append(book_stack)
        db.session.add_all(book_stacks)
        db.session.commit()
        print('\t[green]Book Stacks Created ✅[/green] \n')
    except Exception as e:
        print('\t[red]Book Stack Creation Failed[/red] 😞 \n')
        print(e)  # Printing the exception to understand what went wrong
        sys.exit(1)

if __name__ == '__main__':
    with app.app_context():
        clear_tables()
        load_books()
        create_users()
        create_reviews()
        create_stacks()
        create_book_stacks()