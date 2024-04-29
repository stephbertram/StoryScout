import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import BookCard from '../browse/BookCard'

const Browse = () => {
	// const navigate = useNavigate()
    const { user } = useContext(UserContext)
	const [stackBooks, setStackBooks] = useState([])

	// const handleGoHome = () => {
	// 	navigate('/')
	// }

    // Clean up
	useEffect(() => {
		fetch(`/users/${user.id}/stacks/books`)
			.then((res) => {
				if (res.ok) {
					return res.json().then(setStackBooks)
				}
				return res
					.json()
					.then((errorObj) => toast.error(errorObj.message))
			})
			.catch((err) => {
				toast.error('An unexpected error occurred.')
			})
	}, [user])

    const mappedBooks = stackBooks.map(book => (
        <BookCard 
            key={book.id} 
            id={book.id}
            title={book.title} 
            author={book.author}
            cover_photo={book.cover_photo} 
        />
    ))
    return(
        <div>
            <h3 className='stack'>Books in Your Stack</h3>
            {mappedBooks.length > 0 ? mappedBooks : <p>Loading...</p>}
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
