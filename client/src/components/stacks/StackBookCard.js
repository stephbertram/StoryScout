import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext';

const StackBookCard = ({ id, title, author, cover_photo, onRemove }) => {
    const navigate = useNavigate()
    const { user } = useContext(UserContext)

    const handleNavigate = (e) => {
        e.stopPropagation() // Prevent navigation when clicking on the remove button
        navigate(`/books/${id}`)
    }

    const handleRemove = (e) => {
        e.stopPropagation() // Prevent navigation when clicking on the remove button
        onRemove(user.id, id)
    }


    return (

        // Move Button CSS to index.css

        <div id='book-container' onClick={handleNavigate}>
        <div id='book-cover-photo' style={{ position: 'relative' }}>
            <img src={cover_photo} alt={title} />
            <button 
                onClick={handleRemove} 
                style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    cursor: 'pointer'
                }}>
                X
            </button>
        </div>
        <div className="text-content">
            <h3 id='book-title'>Title: {title}</h3>
            <span id='book-author'>Author: {author}</span>
        </div>
    </div>
    )
}

export default StackBookCard