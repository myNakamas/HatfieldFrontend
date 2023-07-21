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
    const { login, loggedUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const previousPageLocation: Location | undefined = state?.from
    const previousParams: URLSearchParams | undefined = new URLSearchParams(previousPageLocation?.search)
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
                navigate(getPageToRedirectTo(previousPageLocation), { replace: true })
            })
            .catch(() => {
                setError('root', { type: 'value', message: 'Invalid credentials' })
            })
    }
    useEffect(() => {
        if (loggedUser || localStorage.getItem('token'))
            navigate(getPageToRedirectTo(previousPageLocation), { replace: true })
        const usernamePassword = getUsernamePassword(params) ?? getUsernamePassword(previousParams)
        if (usernamePassword) {
            onSubmit(usernamePassword)
        }
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

const getUsernamePassword = (params?: URLSearchParams): UsernamePassword | undefined => {
    const username = params?.get('username')
    const password = params?.get('password')
    if (username && password) {
        return { username, password }
    }
    return undefined
}

const clearParams = (params?: URLSearchParams): string => {
    params?.delete('username')
    params?.delete('password')
    console.log(params?.toString())
    return params?.toString() ?? ''
}

const getPageToRedirectTo = (previousPageLocation: Location | undefined) => {
    const pageToRedirectTo = previousPageLocation?.origin ?? '/home'
    const previousParams: URLSearchParams | undefined = new URLSearchParams(previousPageLocation?.search)
    return `${pageToRedirectTo}?${clearParams(previousParams)}`
}
