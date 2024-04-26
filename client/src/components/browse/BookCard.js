const BookCard = ({title, author, cover_photo}) => {
    return (
        
        <div id='book-container'>
            <div id='book-cover-photo'> 
                <img src={cover_photo} alt={title}/>
            </div>
            <div class="text-content"> 
                <h3 id='book-title'>{title}</h3>
                <span id='book-author'>{author}</span>
            </div>
        </div>
)}

export default BookCard