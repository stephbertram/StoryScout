// import { useState, useEffect } from 'react'
// import toast from 'react-hot-toast'


const Browse = () => {
    // const [books, setBooks] = useState([])

    // API Key = AIzaSyByrsj18Tn_qMZTrR50jTHW2IcL7DNUuqw

    // useEffect(() => {
    //     getBooks()
    // }, [])

    // const getBooks = () => {
    //     const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    //     const url = `https://www.googleapis.com/books/v1/volumes?q=subject:juvenile+fiction&maxResults=40&key=${apiKey}`

    //     fetch(url)
	// 		.then((resp) => {
	// 			if (resp.ok) {
	// 				return resp.json().then(setBooks)
	// 			}
	// 			return resp
	// 				.json()
	// 				.then((errorObj) => toast.error(errorObj.message))
	// 		})
	// 		.catch((err) => {
	// 			toast.error('An unexpected error occurred.')
	// 		})
	// }

    return (
        <div>
            <h1>Browse Component</h1>
        </div>
    )
}

export default Browse

