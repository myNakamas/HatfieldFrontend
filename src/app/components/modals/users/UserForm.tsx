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
import { Controller, FieldError } from 'react-hook-form'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { FormField } from '../../form/Field'

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
    return (
        <>
            <TextField defaultValue={''} register={register('fullName')} error={errors.fullName} label={'FullName'} />
            <TextField
                defaultValue={''}
                register={register('email')}
                error={errors.email}
                label={'Email'}
                type='email'
            />
            <Space direction='vertical'>
                <Typography>Phones</Typography>
                <Button
                    onClick={() => setValue('phones', [...getValues('phones'), ''])}
                    icon={<FontAwesomeIcon size='lg' icon={faPlus} />}
                />
                {watch('phones')?.map((phone, index) => {
                    const error = errors.phones && (errors.phones[index] as FieldError)
                    return (
                        <TextField
                            key={index}
                            register={register(`phones.${index}`)}
                            placeholder={'Add phone'}
                            error={error}
                            button={
                                <Button
                                    onClick={() =>
                                        setValue(
                                            'phones',
                                            getValues('phones').filter((value, i) => i !== index)
                                        )
                                    }
                                    icon={<FontAwesomeIcon color='red' icon={faTrash} />}
                                />
                            }
                        />
                    )
                })}

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
