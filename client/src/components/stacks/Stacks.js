import { useEffect, useState, useContext } from 'react'
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import StackBookCard from './StackBookCard'

const Stacks = () => {
    const { user } = useContext(UserContext)
    const navigate = useNavigate()
	const [stackBooks, setStackBooks] = useState([])

	useEffect(() => {
		fetch(`/users/${user?.id}/stacks/books`)
			.then((res) => {
				if (res.ok) {
					return res.json().then(setStackBooks)
				}
				return res
					.json()
					.then((errorObj) => toast.error(errorObj.Error))
			})
			.catch((error) => {
                console.log('Failed to fetch books in stack:',error)
				toast.error('An unexpected error occurred.')
			})
	}, [user])

    const removeBookFromStack = (book_id) => {
        console.log(`/user/remove_book/${book_id}`)
        fetch(`/user/remove_book/${book_id}`, { method: 'DELETE' })
            .then((res) => {
                if (res.ok) {
                    return res.json().then(() => {
                        setStackBooks(prevBooks => prevBooks.filter(book => book.id !== book_id))
                        })     
                } else {
                    return res.json().then((errorObj) => toast.error(errorObj.Error))
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
        user ? (
        <div className="main-container">
            <h3 className='stack'>Books in Your Stack</h3>
            <div className='books-grid'>
                {mappedBooks.length > 0 ? mappedBooks : <p>There are no books in your stack yet.</p>}
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

export default Stacks
