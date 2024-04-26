import { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { UserContext } from './components/context/UserContext'
import Nav from './components/navigation/Nav'
// import Footer from './components/navigation/Footer'

const App = () => {
  const { user } = useContext(UserContext)

  return (
		<main>
        <Nav />
        <Toaster position="top-center" containerClassName="toaster-style" />
        <Outlet context={{ user }} />
        {/* <Footer /> */}
		</main>
)}

export default App