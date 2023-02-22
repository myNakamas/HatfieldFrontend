import { LoginUserModel } from '../models/interfaces/user'
import { LoginSchema } from '../models/validators/FormValidators'
import { Navigate, useLocation } from 'react-router-dom'
import { useLogin } from '../axios/userRequests'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import '../components/form/form.scss'
import { TextField } from '../components/form/TextField'
import { FormError } from '../components/form/FormError'

export const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginUserModel>({ resolver: yupResolver(LoginSchema) })
    const { isLoggedIn, saveLoggedUser } = useContext(AuthContext)
    const { state } = useLocation()

    const pageToRedirectTo: Location = state?.from ?? '/welcome'

    const onSubmit = (formValues: LoginUserModel) => {
        useLogin(formValues)
            .then(({ user, token }) => {
                saveLoggedUser(user)
                localStorage.setItem('token', token)
            })
            .catch((error) => {
                console.log(error)
                setError('root', { type: 'value', message: 'Invalid credentials' })
            })
    }
    if (isLoggedIn()) return <Navigate to={pageToRedirectTo} replace={true} />

    return (
        <div className='formCenterWrapper'>
            <form className='form' onSubmit={handleSubmit(onSubmit)}>
                <div className='iconWrapper'>
                    <FontAwesomeIcon className='profileImage' icon={faUser} />
                </div>
                <h2>Sign in</h2>

                <TextField register={register('username')} error={errors.username} placeholder='Username*' />
                <TextField
                    register={register('password')}
                    error={errors.password}
                    placeholder='Password*'
                    type='password'
                />
                <label className='left'>
                    <input {...register('remember')} type='checkbox' /> Remember me
                </label>
                <FormError error={errors.root} />
                <button className='button' type='submit'>
                    SIGN IN
                </button>
            </form>
        </div>
    )
}
