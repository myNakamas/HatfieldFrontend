import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { SetPasswordSchema } from '../../models/validators/FormValidators'
import { SetPassword } from '../../models/interfaces/user'
import { TextField } from '../../components/form/TextField'
import { FormError } from '../../components/form/FormError'
import { setNewPassword } from '../../axios/http/userRequests'
import { Button, Card, Space } from 'antd'
import { toast } from 'react-toastify'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const ChangeNewPassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SetPassword>({ resolver: yupResolver(SetPasswordSchema) })
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token')

    useEffect(() => {
        if (!params.has('token')) navigate('/login')
    }, [])

    const onSubmit = ({ password }: SetPassword) => {
        toast
            .promise(setNewPassword(password, token), toastUpdatePromiseTemplate('password'), toastProps)
            .then(() => navigate('/login'))
            .catch(({ detail }) => setError('root', { message: detail }))
    }

    return (
        <div className='mainScreen'>
            <Space>
                <Card title={'Set a new password'}>
                    <p>A strong password helps prevent unauthorized access to your account.</p>
                    <form onSubmit={handleSubmit(onSubmit)} className={'modalForm'}>
                        <div className='p-2 mw-350'>
                            <TextField
                                register={register('password')}
                                label='New password'
                                error={errors.password}
                                type='password'
                            />
                            <TextField
                                register={register('passwordConfirmation')}
                                label='Confirm the new password'
                                error={errors.passwordConfirmation}
                                type='password'
                            />
                            <FormError error={errors.root?.message} />

                            <Button type='primary' htmlType='submit'>
                                Change password
                            </Button>
                        </div>
                    </form>
                </Card>
            </Space>
        </div>
    )
}
