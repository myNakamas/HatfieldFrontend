import { UsernamePassword } from '../models/interfaces/user'
import { LoginSchema } from '../models/validators/FormValidators'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLogin } from '../axios/http/userRequests'
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { FormError } from '../components/form/FormError'
import { Avatar, Button, Input, Space, Typography } from 'antd'

export const Login = () => {
    const [params] = useSearchParams()
    const { login, loggedUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const { state } = useLocation()
    const previousPageLocation: Location | undefined = state?.from
    const previousParams: URLSearchParams | undefined = new URLSearchParams(previousPageLocation?.search)
    const {
        control,
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
                <Avatar size={'large'} shape={'circle'}>
                    <FontAwesomeIcon size={'2xl'} className='profileImage' icon={faUser} />
                </Avatar>

                <Typography>
                    <h2>Sign in</h2>
                </Typography>
                <Controller
                    render={({ field, fieldState }) => (
                        <>
                            <Input value={field.value} onChange={field.onChange} placeholder={'Username*'} />
                            <FormError error={fieldState.error?.message} />
                        </>
                    )}
                    name={'username'}
                    control={control}
                />
                <Controller
                    render={({ field, fieldState }) => (
                        <>
                            <Input.Password
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={'Password*'}
                                autoComplete='current-password'
                            />
                            <FormError error={fieldState.error?.message} />
                        </>
                    )}
                    name={'password'}
                    control={control}
                />
                <FormError error={errors?.root?.message} />
                <Space wrap>
                    <Button htmlType='submit' type={'primary'}>
                        Sign in
                    </Button>
                    <Button type={'link'} onClick={() => navigate('forgot-password')}>
                        Forgot password
                    </Button>
                </Space>
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
    return params?.toString() ?? ''
}

const getPageToRedirectTo = (previousPageLocation: Location | undefined) => {
    const pageToRedirectTo = previousPageLocation?.origin ?? '/home'
    const previousParams: URLSearchParams | undefined = new URLSearchParams(previousPageLocation?.search)
    return `${pageToRedirectTo}?${clearParams(previousParams)}`
}
