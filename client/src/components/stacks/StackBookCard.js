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
        onRemove(id)
    }

    return (

        <div className='book-container' onClick={handleNavigate} style={{ position: 'relative' }}>
            <button id='delete-button' onClick={handleRemove}>X</button>
            <div id='book-cover-photo'>
                <img src={cover_photo} alt={title} />
            </div>
            <div className="text-content">
                <h3 id='book-title'>{title}</h3>
                <div id='book-author'>
                    <span>{author}</span>
                </div>
            </div>
        </div>
    )
}

export default StackBookCard