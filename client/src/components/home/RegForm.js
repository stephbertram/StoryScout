import { useContext, useState, useRef } from 'react'
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

const RegForm = () => {
	const { login } = useContext(UserContext)
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)
	const file = useRef(null)

	const handleIsLogin = () => {
		setIsLogin(!isLogin)
	}

	const handleSubmit = (event, values) => {
		event.preventDefault()
		console.log(values)
		const formData = new FormData(event.target)
		fetch(isLogin ? '/login' : '/signup', {
			method: 'POST',
			body: formData,
		}).then(res => res.json())
		.then(data => {
			if (data.error) {
				console.log(data.error)
				toast.error(data.error)
			} else {
				console.log(data)
				login(data);
				navigate('/books')
				toast.success('Successfully logged in!')
			}
		})
		.catch((error) => {
			toast.error('An unexpected error occurred.')
		})
	
	}

	return (
		<div className='content-container'>
				<h2>Discover your child's next favorite book, guided by trusted ratings and reviews from fellow parents.</h2>
				<h3>{isLogin ? 'Login':'Sign Up'}</h3>
			<Formik
				initialValues = {{
					username: '',
					profile_image: null,
					email: '',
					_password_hash: '',
					confirmPassword: ''
				}}
				validationSchema = {isLogin ? loginSchema : signupSchema}
				onSubmit = {handleSubmit}
			>
				{({ values, onChange, onBlur, errors, touched }) => (
					<Form className='form' onSubmit={e => handleSubmit(e, values)}>
					{/* If signup, show username field */}
					{!isLogin && (
						<>
							<Field
								type='text'
								name='username'
								placeholder='Username'
								// onChange={formik.handleChange}
								// onBlur={formik.handleBlur}
								// value={formik.values.username}
								className='input'
								autoComplete='username'
							/>
							{errors.username && touched.username && (
								<div className='error-message show'>
									{errors.username}
								</div>
							)}
							<label htmlFor="profile_image"> Profile Picture (Optional):</label>
							<input 
								type='file' 
								name='profile_image'
								ref={file}
								// onBlur={handleBlur}
								className='input'
							/>
						</>
					)}
					<Field
						type='text'
						name='email'
						placeholder='Email'
						// onChange={handleChange}
						// onBlur={handleBlur}
						// value={values.email}
						className='input'
						autoComplete='email'
					/>
					{errors.email && touched.email && (
						<div className='error-message show'>
							{errors.email}
						</div>
					)}
					<Field
						type='password'
						name='_password_hash'
						placeholder='Password'
						// onChange={handleChange}
						// onBlur={handleBlur}
						// value={values._password_hash}
						className='input'
						autoComplete='current-password'
					/>
					{errors._password_hash &&
						touched._password_hash && (
							<div className='error-message show'>
								{errors._password_hash}
							</div>
						)}
					{/* If signup, show confirm password field */}
					{!isLogin && (
						<>
							<Field
								type='password'
								name='confirmPassword'
								placeholder='Confirm Password'
								// onChange={handleChange}
								// onBlur={handleBlur}
								// value={values.confirmPassword}
								className='input'
							/>
							{errors.confirmPassword &&
								touched.confirmPassword && (
									<div className='error-message show'>
										{errors.confirmPassword}
									</div>
								)}
						</>
					)}
					<input type='submit' className='submit' value={isLogin ? 'Login' : 'Sign up'} />
					<br />
					{isLogin ? 
					<span onClick={handleIsLogin}>Not a member yet? <u class="reg-link">Sign up</u></span>
					: <span onClick={handleIsLogin}>Already a member? <u class="reg-link">Login</u></span>
					}
				</Form>
				)}
			</Formik>
		</div>
)}

export default RegForm