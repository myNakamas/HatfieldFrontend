import React, { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { FormError } from './FormError';

export const FormField = ({ label, error, children }: { label: string; error?: FieldError; children: ReactNode }) => {
    return (
        <div className='field'>
            <label>
                {label}
                <div className='w-100'>{children}</div>
                <FormError error={error?.message} />
            </label>
        </div>
    )
}
