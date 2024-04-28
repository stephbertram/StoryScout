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
	
	image: Yup.mixed() // Check if correct
		.test("FILE_SIZE", "File must be 1024x1024 or smaller.", (value) => value && value.size < 1024 * 1024)
		.test("FILE_TYPE", "File must be a png or jpeg.", (value) => value && ['image/png', 'image/jpeg'].includes(value.type)),

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
	profile_image: '',
	email: '',
	_password_hash: '',
	confirmPassword: ''
}

const RegForm = () => {
	const { user, login, logout } = useContext(UserContext)
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)
	const [file, setFile] = useState(null)
	

	const requestUrl = isLogin ? '/login' : '/signup'

	const handleIsLogin = () => {
		setIsLogin(!isLogin)
	}

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			formik.setFieldValue("profile_image", e.target.files[0])
			setFile(e.target.files[0])
		}
    }

	const formik = useFormik({
		initialValues,
		validationSchema: isLogin ? loginSchema : signupSchema,
		onSubmit: (values) => {
			const formData = new FormData();
				formData.append('profile_image', file)
			// Append other form data
			Object.keys(values).forEach(key => {
				if (key !== 'profile_image') {
					formData.append(key, values[key]);
				}
			})
	
			fetch(requestUrl, {
				method: 'POST',
				body: formData
			}).then(res => res.json())
				.then(data => {
					if (data.error) {
						toast.error(data.error)
					} else {
						login(data);
						navigate('/books');
						toast.success('Logged in');
					}
				})
				.catch((error) => toast.error(error.message || 'An unexpected error occurred'))
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
							<label htmlFor="profile_file">Upload Profile Picture:</label>
							<input 
								type='file' 
								name='profile_image'
								onChange={handleFileChange} 
								onBlur={formik.handleBlur}
								className='input'
							/>
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
					// <button type='button' className='change-form' onClick={handleIsLogin}>Create New Account</button>
					: <span onClick={handleIsLogin}>Already a member? <u>Login</u></span>
					}
				</Form>
			</Formik>
		</div>
)}

export default RegForm