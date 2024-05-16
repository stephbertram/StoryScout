# StoryScout

## Overview

StoryScout allows parents to discover new children’s books, guided by the trusted ratings and reviews of fellow parents. The app was built using React for the frontend and Python (Flask) for the backend.

Deployed application is available [here](https://storyscout.onrender.com/).

<img width="1335" alt="StoryScout_Homepage_Screenshot" src="https://github.com/stephbertram/StoryScout/assets/154558487/50dbfaf9-7c54-4220-8024-b4979dfacbb5">

---

## Main Features
- Browse list of children’s books and filter by topic, rating, or age recommendation
- View more details on individual books including title, author, description, ratings, reviews, etc.
- Add a book to your “stack” or book list to save and access later
- Write a review for a book, including adding an optional rating and age recommendation
- Edit or delete your user profile

---

## Installation

Fork and clone this repo from Github to your local environment.

**Install and Run Backend Dependencies**
- Ensure Python and Flask are installed on your system
- Navigate to the root directory of the project
- Run `pipenv install` to install dependencies
- Run `pipenv shell` to create virtual environment
- Run `python server/app.py` to run the Flask application

**.env set up**\
\
Create .env file in the root directory and add the following to the file:

```console
FLASK_APP=app.py
FLASK_RUN_PORT=5555
SESSION_SECRET=[See Note Below]
```

**Session Secret**
- In your terminal, run `python -c 'import secrets; print(secrets.token_hex())’` to generate your own session secret key.
- Copy the result into the .env file as the value for the secret key.
- Make sure .env is added to your .gitignore.

**Configuring the Database**
- In the terminal, `cd` into the server directory. Run the following commands:

```console
flask db init
flask db upgrade
python seed.py (this will seed the database)
```

**Install and Run Frontend Dependencies**
- Ensure Node.js and npm (Node Package Manager) are installed on your system.
- In another terminal, `cd` into the client directory within the project.
- Run `npm install` to install all the necessary node modules.
- Run `npm start` to open the app in the browser

---

## License

Distributed under the MIT License. See LICENSE.txt for more information.

---

## Contact

Steph Bertram | [GitHub](https://github.com/stephbertram) | [LinkedIn](https://www.linkedin.com/in/stephanie-bertram/)

---

## Acknowledgements

- Homepage image, LumiNola, "I'm gonna read this whole book today stock photo", [iStock](https://www.istockphoto.com/photo/im-gonna-read-this-whole-book-today-gm1201605429-344660074)


