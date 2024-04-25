import { useContext } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

const Nav = () => {
	const { user, logout } = useContext(UserContext)
    const location = useLocation()
	
    return (
        <header>
            <h1>StoryScout</h1>
            <nav>
                {/* Always show these links if there is a user logged in */}
                {user && (
                    <>
                        <NavLink id='link' to='/browse' className='nav-link'>Browse Books</NavLink>
                        <NavLink id='link' to='/stacks' className='nav-link'>View Stack</NavLink>
                        <NavLink id='link' to='/user/edit' className='nav-link'>Profile</NavLink>
                        <NavLink id='link' to='/' className='nav-link' onClick={logout}>Logout</NavLink>
                    </>
                )}
                {/* Show the Home link only if there is no user and we are not on the homepage */}
                {!user && location.pathname !== '/' && (
                    <NavLink id='link' to='/' className='nav-link'>Home</NavLink>
                )}
            </nav>
        </header>
)}

export default Nav
