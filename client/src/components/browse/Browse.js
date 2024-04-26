import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import toast from 'react-hot-toast'
import BookCard from './BookCard'

const Browse = () => {
	const { user } = useContext(UserContext)
	const navigate = useNavigate()
	const [books, setBooks] = useState([])

	const handleGoHome = () => {
		navigate('/')
	}

	useEffect(() => {
		fetch('/books')
			.then((res) => {
				if (res.ok) {
					return res.json().then(setBooks)
				}
				return res
					.json()
					.then((errorObj) => toast.error(errorObj.message))
			})
			.catch((err) => {
				toast.error('An unexpected error occurred.')
			})
	}, [])

    const mappedBooks = books.map(book => (
        <BookCard 
            key={book.id} 
            title={book.title} 
            author={book.author}
            cover_photo={book.cover_photo} 
            page_count={book.page_count} 
            topic={book.topic} 
            description={book.description} 
        />
    ))
    return(
        <div>
            <h2 className='browse'>Browse Books</h2>
            {mappedBooks.length > 0 ? mappedBooks : <p>No books available.</p>}
        </div>
    )
}

        // user ? (
            // <>
            //     <div>
            //         <h2 className='browse'>Browse Books</h2>
            //         {mappedBooks}
            //     </div>
            // </>
    //     ) : (
    //     <>
    //         <div className='entries-error-message entries'>You must be logged in to view this page.</div>
    //         <button className='error-nav' onClick={handleGoHome}>Go to Login</button>
    //     </>
    // ))
// }

export default Browse
