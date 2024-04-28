import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const BookDetails = () => {
    const { user } = useContext(UserContext)
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: '',
        review: '',
        rec_age: ''
    });

    useEffect(() => {
        fetch(`/books/${id}`)
            .then(response => response.json())
            .then(data => setBook(data))
            .catch(error => {
                console.error('Error fetching book details:', error);
            });
    }, [id]);

    const handleAddReviewClick = () => {
        setShowReviewModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'rating' || name === 'user_id') {
            formattedValue = parseInt(value, 10); // Convert to integer
        }
        setReviewData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        fetch('/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...reviewData, book_id: book.id, user_id: user.id })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Review submitted:', data);
            setShowReviewModal(false);
            // Optionally refresh or update local state to show new review
        })
        .catch(error => {
            console.error('Error submitting review:', error);
        });
    };

    if (!book) {
        return <div>Loading...</div>;
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
                <h3>Placeholder for Reviews</h3>
            </div>
        </div>
    );
};

export default BookDetails;
