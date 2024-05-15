import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const BookDetails = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
    const { id } = useParams()
    const [book, setBook] = useState(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewData, setReviewData] = useState({
        rating: '',
        review: '',
        rec_age: ''
    })

    useEffect(() => {
        fetch(`/books/${id}`)
            .then((res) => {
                if (res.ok) {
                    return res.json().then(setBook)
                }
                return res
                    .json()
                    .then((errorObj) => toast.error(errorObj.Error))
        }) 
        .catch(error => {
            console.error('Error fetching book details:', error)
            toast.error('Error fetching book details.')
            })
    }, [id])

    if (!book) {
        return <div>Loading...</div>
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

    const handleSubmitReview = (e) => {
        e.preventDefault()
        fetch('/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...reviewData, book_id: book.id, user_id: user.id })
        })
            .then((res) => {
                if (res.ok) {
                    return res.json().then((data) => {
                        setShowReviewModal(false)
                        setBook(prevBook => ({
                            ...prevBook,
                            reviews: [...prevBook.reviews, data]
                        }))
                    })        
                } else {
                    return res.json().then((errorObj) => toast.error(errorObj.Error))
                }
            })
            .catch(error => {
                console.error('Error submitting review:', error)
                toast.error('Failed to submit review.')
            })
        }

    const handleAddToStack = () => {
        if (!user || !user.id || !book || !book.id) {
            toast.error('Invalid operation.')
            return
        }
        fetch(`/${user.id}/add_to_stack/${book.id}`, {
            method: 'POST'
        })
        .then(res => {
            if (res.ok) {
                return res.json().then(() => {
                    toast.success('Book added to your stack!')
                })
            } else {
                return res.json().then((errorObj) => {
                    toast.error(errorObj.Error)
                })
            }
        })
        .catch(error => {
            console.error('Error adding book to stack:', error)
            toast.error('Failed to add book to stack.')
        })
    }

    return (
        user ? (
        <div className='main-container'>
            <div>
                <button id='back-button' onClick={() => {navigate(-1)}}>Back</button>
            </div>
            <div className="book-details-container">
                <div className='book-cover'>
                    <img src={book.cover_photo} alt={book.title} />
                </div>
                <div className='book-details'>
                    <span><strong>Title:</strong> {book.title}</span>
                    <span><strong>Author:</strong> {book.author}</span>
                    <span><strong>Page Count:</strong> {book.page_count}</span>
                    <span><strong>Topic:</strong> {book.topic}</span>
                    <span><strong>Av. Rating:</strong> {book.average_rating ? book.average_rating.toFixed(1) : 'No Ratings'} / 5</span>
                    <span><strong>Rec. Age:</strong> {book.rec_age_mode}</span>
                    <p>{book.description}</p>
                </div>
            </div>
            <div className='buttons-container'>
                <button onClick={handleAddToStack}>Add to Stack</button>
                <button onClick={handleAddReviewClick}>Add Review</button>
            </div>
            {showReviewModal && (
                <div className='review-container'>
                    <h3>Add Your Review</h3>
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
                    <button id="close-button" onClick={() => setShowReviewModal(false)}>X</button>
                </div>
            )}
            <div className='reviews-container'>
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
