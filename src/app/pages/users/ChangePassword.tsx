import React from 'react'
import { SettingsCard } from './Profile'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ResetPasswordSchema } from '../../models/validators/FormValidators'
import { ResetPassword } from '../../models/interfaces/user'
import { TextField } from '../../components/form/TextField'
import { FormError } from '../../components/form/FormError'

export const ChangePassword = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPassword>({ resolver: yupResolver(ResetPasswordSchema) })

    const onSubmit = ({ password, oldPassword }: ResetPassword) => {
        console.log(password, oldPassword)
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

                        <button className='actionButton' type='submit'>
                            Change password
                        </button>
                    </div>
                </form>
            </SettingsCard>
        </div>
    )
}
