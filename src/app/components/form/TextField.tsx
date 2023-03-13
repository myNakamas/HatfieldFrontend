import { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import React, { ReactNode } from 'react'
import { FormError } from './FormError'

interface TextFieldProps {
    register: UseFormRegisterReturn
    label?: string
    placeholder?: string
    error?: FieldError
    type?: string
    defaultValue?: string
    button?: ReactNode
}

export const TextField = ({ label, error, button, register, ...rest }: TextFieldProps) => {
    return (
        <div className='textField'>
            <label>
                {label}
                <div className='flex-100 align-center'>
                    <input className={`input ${error && 'error'}`} {...register} {...rest} /> {button}
                </div>
                <FormError error={error?.message} />
            </label>
        </div>
    )
}
