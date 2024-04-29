import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes'
import UserProvider from './components/context/UserContext'
import './index.css'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement)

root.render(
    <UserProvider>
        <RouterProvider router={router} />
    </UserProvider>
)
