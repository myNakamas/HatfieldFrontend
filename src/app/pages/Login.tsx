import { UsernamePassword } from '../models/interfaces/user'
import { LoginSchema } from '../models/validators/FormValidators'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLogin } from '../axios/http/userRequests'
import { useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { TextField } from '../components/form/TextField'
import { FormError } from '../components/form/FormError'

export const Login = () => {
    const [params] = useSearchParams()
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const pageToRedirectTo = state?.from && state?.from !== '/login' ? state.from : '/home'
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<UsernamePassword>({ resolver: yupResolver(LoginSchema) })

    const onSubmit = (formValues: UsernamePassword) => {
        useLogin(formValues)
            .then(({ user, token }) => {
                login(user, token)
                navigate(pageToRedirectTo, { replace: true })
            })
            .catch(() => {
                setError('root', { type: 'value', message: 'Invalid credentials' })
            })
    }
    useEffect(() => {
        if (params.has('username') && params.has('password')) {
            onSubmit({ username: params.get('username'), password: params.get('password') } as UsernamePassword)
        }
        if (localStorage.getItem('token')) navigate(pageToRedirectTo, { replace: true })
    }, [])

    return (
        <div className='formCenterWrapper'>
            <form className='loginForm' onSubmit={handleSubmit(onSubmit)}>
                <div className='icon-l'>
                    <FontAwesomeIcon className='profileImage' icon={faUser} />
                </div>
                <h2>Sign in</h2>

                <TextField
                    register={register('username')}
                    error={errors.username}
                    placeholder='Username*'
                    autoComplete='username'
                />
                <TextField
                    register={register('password')}
                    error={errors.password}
                    placeholder='Password*'
                    type='password'
                    autoComplete='current-password'
                />
                <FormError error={errors?.root?.message} />
                <button className='button' type='submit'>
                    SIGN IN
                </button>
            </form>
        </div>
    )
}
