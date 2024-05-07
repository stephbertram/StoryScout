import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const BookDetails = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: '',
        review: '',
        rec_age: ''
    });

    // Clean up
    useEffect(() => {
        fetch(`/books/${id}`)
            .then(response => response.json())
            .then(data => setBook(data))
            .catch(error => {
                console.error('Error fetching book details:', error)
                toast.error('Error fetching book details.')
            })
    }, [id])

    if (!book) {
        return <div>Loading...</div>;
    }

    const handleAddReviewClick = () => {
        setShowReviewModal(true)
    };

    const handleChange = (e) => {
        const { name, value } = e.target
        let formattedValue = value
        if (name === 'rating' || name === 'user_id') {
            formattedValue = parseInt(value, 10) // Convert to integer
        }
        setReviewData(prev => ({ ...prev, [name]: formattedValue }))
    }

    // Clean up
    const handleSubmitReview = (e) => {
        e.preventDefault()
        fetch('/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...reviewData, book_id: book.id, user_id: user.id })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Review submitted:', data)
            setShowReviewModal(false);
            setBook(prevBook => ({
                ...prevBook,
                reviews: [...prevBook.reviews, data]
                })
            )
        })
        .catch(error => {
            console.error('Error submitting review:', error)
            toast.error('Failed to submit review.')
        })
    }

    // Clean up
    const handleAddToStack = () => {
        if (!user || !user.id || !book || !book.id) {
            toast.error('Invalid operation.')
            return
        }
        fetch(`/${user.id}/add_to_stack/${book.id}`, {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                toast.error(data.error)
            } else {
                toast.success('Book added to your stack!')
            }
        })
        .catch(error => {
            console.error('Error adding book to stack:', error)
            toast.error('Failed to add book to stack.')
        })
    }

    return (
        user ? (
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
                <button onClick={handleAddToStack}>Add to Stack</button>
                <button onClick={handleAddReviewClick}>Add Review</button>
            </div>
            {showReviewModal && (
                <div>
                    <h2>Add Your Review</h2>
                    <textarea
                        placeholder="Write your review here..."
                        name="review"
                        value={reviewData.review}
                        onChange={handleChange}
                    />
                    <select name="rating" value={reviewData.rating} onChange={handleChange}>
                        <option value="">Select a rating</option>
                        {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                    <select name="rec_age" value={reviewData.rec_age} onChange={handleChange}>
                        <option value="">Select recommended age</option>
                        <option value="Board Books (Ages 0-3)">Board Books (Ages 0-3)</option>
                        <option value="Picture Books (Ages 3-6)">Picture Books (Ages 3-6)</option>
                        <option value="Early Reader Books (Ages 5-7)">Early Reader Books (Ages 5-7)</option>
                        <option value="Chapter Books (Ages 7-10)">Chapter Books (Ages 7-10)</option>
                    </select>
                    <button onClick={handleSubmitReview}>Submit Review</button>
                    <button onClick={() => setShowReviewModal(false)}>Close</button>
                </div>
            )}
            <br />
            <br />
            <div>
                <h3>Reviews</h3>
                {book.reviews && book.reviews.length > 0 ? (
                    book.reviews.map((review, index) => (
                        <div key={index}>
                            <p>{review.review}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>
        </div>
        ) : (
        <>
            <div className='nav-error'>You must be logged in to view this page.</div>
            <button className='error-nav' onClick={() => navigate('/')}>Go to Login</button>
        </>
        )
    )
}

export default BookDetails;
