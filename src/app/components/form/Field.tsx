import React, { ReactNode } from 'react'
import { FieldError } from 'react-hook-form'
import { FormError } from './FormError'
import { Form } from 'antd'

export const FormField = ({ label, error, children }: { label: string; error?: FieldError; children: ReactNode }) => {
    return (
        <div className='field'>
            <label className='w-100'>
                {label}
                <div className='w-100'>{children}</div>
                <FormError error={error?.message} />
            </label>
        </div>
    )
}

export const AntFormField = ({
    label,
    error,
    children,
    extra,
}: {
    label?: string
    error?: FieldError
    children: ReactNode
    extra?: ReactNode
}) => {
    return (
        <Form.Item extra={extra} label={label}>
            {children}
            <Form.ErrorList errors={[error?.message]} />
        </Form.Item>
    )
}
