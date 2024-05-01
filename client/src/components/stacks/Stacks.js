import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StackBookCard from './StackBookCard'

const Stacks = () => {
	// const navigate = useNavigate()
    const { user } = useContext(UserContext)
	const [stackBooks, setStackBooks] = useState([])

	// const handleGoHome = () => {
	// 	navigate('/')
	// }


    // Fetch Books in User's Stack - CLEAN UP
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
                console.log('Failed to fetch books in stack:',err)
				toast.error('An unexpected error occurred.')
			})
	}, [user])



    // Remove Book from User's Stack - CLEAN UP
    const removeBookFromStack = (user_id, book_id) => {
        fetch(`/${user_id}/remove_book/${book_id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error('Error removing book:', data.error)
                    toast.error("Error removing book.")
                } else {
                    console.log('Book removed successfully');
                    setStackBooks(prevBooks => prevBooks.filter(book => book.id !== book_id))
                }
            })
            .catch(error => {
                console.error('Failed to remove book from stack:', error)
                toast.error('Failed to remove book from stack:')
            })
    }



    const mappedBooks = stackBooks.map(book => (
        <StackBookCard 
            key={book.id} 
            id={book.id}
            title={book.title} 
            author={book.author}
            cover_photo={book.cover_photo} 
            onRemove={removeBookFromStack}
        />
    ))
    return(
        <div>
            <h3 className='stack'>Books in Your Stack</h3>
            {mappedBooks.length > 0 ? mappedBooks : <p>There are no books in your stack yet.</p>}
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

export default Stacks
