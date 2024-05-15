import { createContext, useState } from 'react'
import toast from 'react-hot-toast'
import {useEffect} from 'react'

export const UserContext = createContext()

const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null)

	const login = (user) => {
		setUser(user)
	}

	const logout = (user) => {
		try {
			fetch('/logout', { method: 'DELETE' }).then((res) => {
				if (res.status === 204) {
					setUser(null)
					toast.success("You've been logged out!")
				} else {
					toast.error('Something went wrong while logging out. Please try again.')
				}
			})
		} catch (err) {
			throw err
    }}


    // Refresh
    useEffect(() => {
        fetch('/me')
        .then(resp => {
            if (resp.ok) {
            resp.json().then(setUser)
            
            } else {
            toast.error('Please log in')
            }
        })
    }, [])

    return (
        <UserContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </UserContext.Provider>
)}

export default UserProvider