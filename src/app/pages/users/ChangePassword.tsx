import React from 'react'
import { SettingsCard } from './Profile'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ResetPasswordSchema } from '../../models/validators/FormValidators'
import { ResetPassword } from '../../models/interfaces/user'
import { TextField } from '../../components/form/TextField'
import { FormError } from '../../components/form/FormError'
import { changePassword } from '../../axios/http/userRequests'
import { Button } from 'antd'

export const ChangePassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<ResetPassword>({ resolver: yupResolver(ResetPasswordSchema) })

    const onSubmit = ({ password, oldPassword }: ResetPassword) => {
        changePassword({ password, oldPassword } as ResetPassword).catch((reason) =>
            setError('root', { message: reason })
        )
    }

    return (
        <div className='setting'>
            <h2>Change password</h2>
            <p>A strong password helps prevent unauthorized access to your account.</p>
            <SettingsCard>
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
                        <TextField
                            register={register('oldPassword')}
                            label='Old password'
                            error={errors.oldPassword}
                            type='password'
                        />
                        <FormError error={errors.root?.message} />

                        <Button type='primary' htmlType='submit'>
                            Change password
                        </Button>
                    </div>
                </form>
            </SettingsCard>
        </div>
    )
}
