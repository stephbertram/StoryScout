import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import BookCard from './BookCard'

const Browse = () => {
    const [books, setBooks] = useState([])
    const [topic, setTopic] = useState('')
    const [rating, setRating] = useState('')
    const [recAge, setRecAge] = useState('')

    const topics=[
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
    const ratings = [5, 4, 3, 2, 1]
    const recommendedAges = [
        "Board Books (Ages 0-3)", 
        "Picture Books (Ages 3-6)",  
        "Early Reader Books (Ages 5-7)", 
        "Chapter Books (Ages 7-10)"
        ]

    useEffect(() => {
        const fetchBooks = () => {
            const queryParams = new URLSearchParams({
                ...(topic && { topic }),
                ...(rating && { rating }),
                ...(recAge && { rec_age: recAge }),
            }).toString()

            fetch(`/books?${queryParams}`)
                .then(res => {
                    if (res.ok) {
                        return res.json().then(setBooks)
                    }
                    return res.json().then((errorObj) => toast.error(errorObj.message))
                })
                .catch(err => {
                    toast.error('An unexpected error occurred.')
                })
        }

        fetchBooks()
    }, [topic, rating, recAge])  // Refetch when filters change

    const handleTopicChange = (e) => setTopic(e.target.value)
    const handleRatingChange = (e) => setRating(e.target.value)
    const handleRecAgeChange = (e) => setRecAge(e.target.value)

    const mappedBooks = books.map(book => (
        <BookCard 
            key={book.id} 
            id={book.id}
            title={book.title} 
            author={book.author}
            cover_photo={book.cover_photo} 
        />
    ))

    return (
        <div>
            <h3 className='browse'>Browse Books</h3>
            <div>
                <select value={topic} onChange={handleTopicChange}>
                    <option value="">Select Topic</option>
                    {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
                </select>
                <select value={rating} onChange={handleRatingChange}>
                    <option value="">Select Av. Rating</option>
                    {ratings.map(rating => <option key={rating} value={rating}>{rating}</option>)}
                </select>
                <select value={recAge} onChange={handleRecAgeChange}>
                    <option value="">Select Recommended Age</option>
                    {recommendedAges.map(age => <option key={age} value={age}>{age}</option>)}
                </select>
            </div>
            {mappedBooks.length > 0 ? mappedBooks : <p>Loading...</p>}
        </div>
    )
}

export default Browse
