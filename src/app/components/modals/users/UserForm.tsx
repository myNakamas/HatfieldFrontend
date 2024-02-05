import {
    Control,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form/dist/types/form'
import { User } from '../../../models/interfaces/user'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import React from 'react'
import { TextField } from '../../form/TextField'
import { Button, Space, Switch, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { Controller } from 'react-hook-form'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { FormField } from '../../form/Field'
import { PhoneSelect } from '../../form/PhoneSelect'

export const UserForm = ({
    register,
    watch,
    control,
    errors,
    getValues,
    setValue,
}: {
    register: UseFormRegister<User>
    watch: UseFormWatch<User>
    control: Control<User>
    errors: FieldErrors<User>
    getValues: UseFormGetValues<User>
    setValue: UseFormSetValue<User>
}) => {
    watch('phones')
    return (
        <>
            <Space direction='vertical'>
                <Typography>Phones</Typography>
                <Button
                    onClick={() => setValue('phones', [...getValues('phones'), ''])}
                    icon={<FontAwesomeIcon size='lg' icon={faPlus} />}
                />
                {watch('phones')?.map((phone, index) => (
                    <Space key={index}>
                        <Controller
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <PhoneSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={error?.message}
                                    extra={
                                        <Button
                                            danger
                                            onClick={() =>
                                                setValue(
                                                    'phones',
                                                    getValues('phones').filter((value, i) => i !== index)
                                                )
                                            }
                                            icon={<FontAwesomeIcon icon={faTrash} />}
                                        />
                                    }
                                />
                            )}
                            name={`phones.${index}`}
                        />
                    </Space>
                ))}
                <TextField
                    defaultValue={''}
                    register={register('email')}
                    error={errors.email}
                    inputMode={'email'}
                    label={'Email'}
                    type='email'
                />
                <Space>
                    <Controller
                        control={control}
                        name={'smsPermission'}
                        render={({ field, fieldState }) => (
                            <FormField label={'Receive SMS notifications'} error={fieldState.error}>
                                <Switch checked={field.value} onChange={field.onChange} />
                            </FormField>
                        )}
                    />
                    <Controller
                        control={control}
                        name={'emailPermission'}
                        render={({ field, fieldState }) => (
                            <FormField label={'Receive Email notifications'} error={fieldState.error}>
                                <Switch checked={field.value} onChange={field.onChange} />
                            </FormField>
                        )}
                    />
                </Space>
            </Space>
        </>
    )
}
