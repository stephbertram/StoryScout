#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc
import csv

# Remote library imports
from faker import Faker
from rich import print
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Local imports
from config import db, app

fake = Faker()

with app.app_context():

    # BEGIN SEED
    print('\n[purple]------------- BEGIN ------------[/purple]')
    print('\n')

    # Clean Database
    print('[purple]Cleaning Database 🧽 [/purple]...\n')
    try:
        BookStack.query.delete()
        Book.query.delete()
        Review.query.delete()
        Stack.query.delete()
        User.query.delete()
        db.session.commit()
        print('\t[green]Cleaning Complete[/green] ✅\n')
    except Exception as e:
        print('\t[red]Cleaning Failed[/red] 😞\n')
        sys.exit(1)
    

    # # # # # Create Categories
    print('[purple]Creating Books 🔮[/purple] ...\n')
    engine = create_engine('sqlite:///yourdatabase.db')  # or the appropriate database URL
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()   