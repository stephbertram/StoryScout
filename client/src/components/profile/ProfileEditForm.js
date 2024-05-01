import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import * as Yup from 'yup'
import YupPassword from 'yup-password'
import { object, string } from 'yup'
import { Formik, Form, Field, useFormik } from 'formik'
import { UserContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

YupPassword(Yup)

// Edit Profile
const editSchema = object({
	username: string()
		.min(3, 'Username must be at least 3 characters long.')
		.max(20, 'Username must be 20 characters or less.'),
		// .required('Username is required.'),

	email: string().email("Invalid email format.")
		.min(5, 'Email must be at least 5 characters long.')
		.max(40, 'Email must be 40 characters or less.'),
		// .required('Email is required.'),

	_password_hash: string()
		.min(8, 'Password must be at least 8 characters long.')
		.matches(/[a-zA-Z0-9]/, 'Password should contain letters and numbers.')
		.minLowercase(1, 'Password must contain at least 1 lowercase letter.')
		.minUppercase(1, 'Password must contain at least 1 uppercase letter.')
		.minNumbers(1, 'Password must contain at least 1 number.')
		.minSymbols(1, 'Password must contain at least 1 special character.'),
		// .required('Password is required.'),

	confirmPassword: string()
		.oneOf([Yup.ref('_password_hash'), null], 'Passwords must match.'),
		// .required('Confirm Password is required.')
})




// const ProfileEditForm = () => {

// 	const { user, setUser, login, logout } = useContext(UserContext)

//     const initialValues = {
//         username: user.username,
//         email: user.email,
//         _password_hash: '',
//         confirmPassword: ''
//     }

// 	const formik = useFormik({
// 		initialValues,
// 		validationSchema: editSchema,
// 		onSubmit: (formData) => {
// 			console.log(formData)
// 			fetch(`/users/${user.id}`, {
// 				method: 'PATCH',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				},
// 				body: JSON.stringify(formData)
// 			}).then((res) => {
// 				if (res.ok) {
//                     return res.json().then((data) => {
//                         setUser(data)
//                         toast.success("Profile has been updated.")
//                     })
//                 } else {
//                     return res
//                         .json()
//                         .then((errorObj) => toast.error(errorObj.message))
//                 }
//             })
//             .catch((error) => console.error('Error:', error))
//     }
// })

const ProfileEditForm = () => {
    const { user, setUser } = useContext(UserContext)
    const navigate = useNavigate()
    const formik = useFormik({
        initialValues: {
            username: user?.username || '',
            email: user?.email || '',
            _password_hash: '',
            confirmPassword: ''
        },
        validationSchema: editSchema,
        onSubmit: (values) => {
        // Filter out unchanged and unnecessary fields
        const changes = Object.keys(values).reduce((acc, key) => {
            if (values[key] && values[key] !== user[key] && key !== 'confirmPassword') {
                acc[key] = values[key];
            }
            return acc;
        }, {});

        console.log(changes)

        if (Object.keys(changes).length > 0) {
            fetch(`/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(changes)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                toast.error(data.error);
                } else {
                setUser(data);  // Update user context
                toast.success('Profile updated successfully.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Failed to update profile.');
            });
            } else {
            toast.error('No changes detected.');
            }
        }
    });

    const handleDelete = () => {
        fetch(`/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((resp) => {
            if (resp.ok) {
                setUser(null)
                navigate('/')
                toast.success("Your account has been deleted.")
            } else {
                return resp
                    .json()
                    .then((errorObj) => toast.error(errorObj.message))
            }
        })
        .catch((error) => console.error('Error:', error))
}
    

	return (
		<div className='auth'>
			<Formik onSubmit={formik.handleSubmit}>
				<Form className='form' onSubmit={formik.handleSubmit}>
                    <label htmlFor="username">Username:</label>
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
                    <label htmlFor="email">Email:</label>
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
                    <label htmlFor="_password_hash">Password:</label>
					<Field
						type='password'
						name='_password_hash'
						placeholder='New Password'
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
                    <Field
                        type='password'
                        name='confirmPassword'
                        placeholder='Confirm New Password'
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
					<input type='submit' className='submit' value='Submit Changes' />
				</Form>
			</Formik>
            <br />
            <br />
            <button onClick={handleDelete}>Delete Account</button>
		</div>
)}

export default ProfileEditForm