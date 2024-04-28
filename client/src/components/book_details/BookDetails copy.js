import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const BookDetails = () => {
    const { id } = useParams()
    const [book, setBook] = useState(null)

    // Need to clean up
    useEffect(() => {
        fetch(`/books/${id}`)
            .then(response => response.json())
            .then(data => setBook(data))
            .catch(error => {
                console.error('Error fetching book details:', error);
            })
    }, [id])

    if (!book) {
        return <div>Loading...</div>
    }

    return (
        <div>
                <div>
                    <h2>{book.title}</h2>
                    <img src={book.cover_photo} alt={book.title} />
                    <h3>Author: {book.author}</h3>
                    <h3>Page Count: {book.page_count}</h3>
                    <h3>Topic: {book.topic}</h3>
                    <h3>Av. Rating: {book.average_rating ? book.average_rating.toFixed(2) : 'No Ratings'}</h3>
                    <h3>Recommended Age: {book.rec_age_mode}</h3>
                    <p>Description: {book.description}</p>
                </div>
                <div>
                    <button>Add to Stack</button>
                    <button>Add Review</button>
                </div>
                <br />
                <br />
                <div>
                    <h3>Placeholder for Reviews</h3>
                </div>
        </div>
    )
}

export default BookDetails;