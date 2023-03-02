import React from 'react'
import CreatableSelect from 'react-select/creatable'
import { SelectStyles, SelectTheme } from '../../styles/components/stylesTS'
import { FormError } from './FormError'
import { Control, Controller } from 'react-hook-form'
import Select, { SingleValue } from 'react-select'

export const FormSelect = <T,>({
    label,
    isCreatable,
    control,
    name,
    transformResult,
    ...selectProps
}: {
    label: string
    control: Control<any>
    name: string
    options?: T[]
    isCreatable?: boolean
    placeholder?: string
    getOptionLabel: (item: T) => string
    getOptionValue: (item: T) => string
    transformResult?: (item: SingleValue<T>) => any
}) => {
    const FormSelect = isCreatable ? CreatableSelect : Select
    const transform = transformResult ? transformResult : (item: SingleValue<T>) => item

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                return (
                    <div className='field'>
                        <div className='flex justify-start textFormLabel'>{label}</div>
                        <FormSelect<T, false>
                            theme={SelectTheme}
                            styles={SelectStyles()}
                            isClearable
                            onChange={(item) => field.onChange(transform(item))}
                            onCreateOption={(value) => field.onChange({ id: -1, value })}
                            value={field.value as T}
                            {...selectProps}
                        />
                        <FormError error={fieldState.error?.message} />
                    </div>
                )
            }}
        />
    )
}
