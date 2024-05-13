import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

const Nav = () => {
	const { user, logout } = useContext(UserContext)
    const location = useLocation()
	
    return (
        <header>

            <img src='/text-logo.png' id="text-logo" alt="StoryScout" />
            <img src='/logo.png' id="logo" alt="book with microscope logo" />
            <nav>
                {/* Show links if there is a user logged in */}
                {user && (
                    <>
                        <NavLink to='/browse' className='nav-link'>Browse Books</NavLink>
                        <NavLink to='/stack' className='nav-link'>View Stack</NavLink>
                        <NavLink to='/user/edit' className='nav-link'>Profile</NavLink>
                        <NavLink to='/' className='nav-link' onClick={logout}>Logout</NavLink>
                    </>
                )}
                {/* Show the Home link only if there is no user and we are not on the homepage */}
                {!user && location.pathname !== '/' && (
                    <NavLink to='/' className='nav-link'>Home</NavLink>
                )}
            </nav>
        </header>
)}

export default Nav
