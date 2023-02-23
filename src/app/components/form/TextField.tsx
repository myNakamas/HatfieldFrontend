import { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import React from 'react'
import { FormError } from './FormError'

interface TextFieldProps {
    register: UseFormRegisterReturn
    label?: string
    placeholder?: string
    error?: FieldError
    type?: string
}

export const TextField = ({ label, error, register, ...rest }: TextFieldProps) => {
    return (
        <div className='textField'>
            <label>
                {label}
                <input className={`input ${error && 'error'}`} {...register} {...rest} />
                <FormError error={error?.message} />
            </label>
        </div>
    )
}
