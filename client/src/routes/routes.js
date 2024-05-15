import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Error from '../components/errors/Error'
import Browse from '../components/browse/Browse'
import BookDetails from '../components/book_details/BookDetails'
import Stacks from '../components/stacks/Stacks'
import Profile from '../components/profile/Profile'
import Home from '../components/home/Home'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                path: '/',
                element: <Home />,
                index: true
            },
            {
                path: '/browse', 
                element: <Browse />
            },
            {
                path: '/books/:id',
                element: <BookDetails />
            },
            {
                path: '/stack',
                element: <Stacks />
            },
            {
                path: '/user/edit',
                element: <Profile />
            },
    ]}
])

export default router