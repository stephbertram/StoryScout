import { useNavigate } from 'react-router-dom'

const BookCard = ({ id, title, author, cover_photo }) => {
    const navigate = useNavigate()

    const handleNavigate = () => {
        navigate(`/books/${id}`);
    };

    return (
        <div className='book-container' onClick={handleNavigate}>
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
    );
}

export default BookCard