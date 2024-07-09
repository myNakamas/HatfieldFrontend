import {
    Control,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from 'react-hook-form/dist/types/form'
import { User } from '../../../models/interfaces/user'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import React, { useState } from 'react'
import { AntTextField, TextField } from '../../form/TextField'
import { Button, Input, Space, Switch, Typography } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { Controller } from 'react-hook-form'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { AntFormField, FormField } from '../../form/Field'
import { PhoneSelect } from '../../form/PhoneSelect'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

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
    const [manualPhones, setManualPhones] = useState(false)

    return (
        <>
            <Space direction='vertical'>
                <Typography>Phones</Typography>
                <Space>
                    <Button
                        onClick={() => setValue('phones', [...getValues('phones'), '+44-'])}
                        icon={<FontAwesomeIcon size='lg' icon={faPlus} />}
                    />
                    <Button onClick={() => setManualPhones((prev) => !prev)} icon={<FontAwesomeIcon icon={faEdit} />} />
                </Space>

                {watch('phones')?.map((phone, index) => (
                    <Space key={watch('userId') ?? 'new' + index} align='start'>
                        {manualPhones ? (
                            <AntTextField<User> control={control} name={`phones.${index}`} />
                        ) : (
                            <Controller
                                control={control}
                                render={({ field, fieldState: { error } }) => (
                                    <PhoneSelect
                                        error={error?.message}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                                name={`phones.${index}`}
                            />
                        )}

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
