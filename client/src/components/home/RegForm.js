import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as Yup from 'yup'
import YupPassword from 'yup-password'
import { object, string } from 'yup'
import { Formik, Form, Field, useFormik } from 'formik'
import { UserContext } from '../context/UserContext'

YupPassword(Yup)

// Signup
const signupSchema = object({
	username: string()
		.min(3, 'Username must be at least 3 characters long.')
		.max(20, 'Username must be 20 characters or less.')
		.required('Username is required.'),

	email: string().email("Invalid email format.")
		.min(5, 'Email must be at least 5 characters long.')
		.max(40, 'Email must be 40 characters or less.')
		.required('Email is required.'),

	_password_hash: string()
		.min(8, 'Password must be at least 8 characters long.')
		.matches(/[a-zA-Z0-9]/, 'Password should contain letters and numbers.')
		.minLowercase(1, 'Password must contain at least 1 lowercase letter.')
		.minUppercase(1, 'Password must contain at least 1 uppercase letter.')
		.minNumbers(1, 'Password must contain at least 1 number.')
		.minSymbols(1, 'Password must contain at least 1 special character.')
		.required('Password is required.'),

	confirmPassword: string()
		.oneOf([Yup.ref('_password_hash'), null], 'Passwords must match.')
		.required('Confirm Password is required.')
})

// Login
const loginSchema = object({
	email: string().email("Invalid email format.").required('Email is required.'),

	_password_hash: string()
		.min(8, 'Password must be at least 8 characters long.')
		.matches(/[a-zA-Z0-9]/, 'Password should contain letters and numbers.')
		.minLowercase(1, 'Password must contain at least 1 lowercase letter.')
		.minUppercase(1, 'Password must contain at least 1 uppercase letter.')
		.minNumbers(1, 'Password must contain at least 1 number.')
		.minSymbols(1, 'Password must contain at least 1 special character.')
		.required('Password is required.'),
})

const initialValues = {
	username: '',
	email: '',
	_password_hash: '',
	confirmPassword: ''
}

const RegForm = () => {
	const { user, login, logout } = useContext(UserContext)
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)


	const requestUrl = isLogin ? '/login' : '/signup'

	const handleIsLogin = () => {
		setIsLogin(!isLogin)
	}

	const formik = useFormik({
		initialValues,
		validationSchema: isLogin ? loginSchema : signupSchema,
		onSubmit: (formData) => {
			console.log(formData)
			fetch(requestUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			}).then((res) => {
				if (res.ok) {
					res.json()
						.then((userData) => {
							login(userData)
						})
						.then(() => {
							navigate('/books') 
							toast.success('Logged in')
						})
					console.log(user)
				} else if (res.status === 422) {
					toast.error('Invalid Login')
				} else {
					return res
						.json()
						.then((errorObj) => toast.error(errorObj.Error))}
			})
		}
	})

	return (
		<div className='auth'>
			<h2>{isLogin ? 'Login':'Sign Up'}</h2>
			<Formik onSubmit={formik.handleSubmit}>
				<Form className='form' onSubmit={formik.handleSubmit}>
					{/* If signup, show username field */}
					{!isLogin && (
						<>
							<Field
								type='text'
								name='username'
								placeholder='Username'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.username}
								className='input'
								autoComplete='username'
							/>
							{formik.errors.username && formik.touched.username && (
								<div className='error-message show'>
									{formik.errors.username}
								</div>
							)}
						</>
					)}
					<Field
						type='text'
						name='email'
						placeholder='Email'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values.email}
						className='input'
						autoComplete='email'
					/>
					{formik.errors.email && formik.touched.email && (
						<div className='error-message show'>
							{formik.errors.email}
						</div>
					)}
					<Field
						type='password'
						name='_password_hash'
						placeholder='Password'
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						value={formik.values._password_hash}
						className='input'
						autoComplete='current-password'
					/>
					{formik.errors._password_hash &&
						formik.touched._password_hash && (
							<div className='error-message show'>
								{formik.errors._password_hash}
							</div>
						)}
					{/* If signup, show confirm password field */}
					{!isLogin && (
						<>
							<Field
								type='password'
								name='confirmPassword'
								placeholder='Confirm Password'
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								value={formik.values.confirmPassword}
								className='input'
							/>
							{formik.errors.confirmPassword &&
								formik.touched.confirmPassword && (
									<div className='error-message show'>
										{formik.errors.confirmPassword}
									</div>
								)}
						</>
					)}
					<input type='submit' className='submit' value={isLogin ? 'Login' : 'Sign up'} />
					<br />
					{isLogin ? 
					<span onClick={handleIsLogin}>Not a member yet? <u>Sign up</u></span>
					: <span onClick={handleIsLogin}>Already a member? <u>Login</u></span>
					}
				</Form>
			</Formik>
		</div>
)}

export default RegForm