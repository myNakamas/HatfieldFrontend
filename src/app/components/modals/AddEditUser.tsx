import { AppModal } from './AppModal'
import { User } from '../../models/interfaces/user'
import { Controller, FieldError, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ObjectSchema } from 'yup'
import { TextField } from '../form/TextField'
import { UserRolesArray } from '../../models/enums/userEnums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { FormError } from '../form/FormError'
import Select from 'react-select'
import { FormField } from '../form/Field'
import { SelectTheme } from '../../styles/components/stylesTS'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { Shop } from '../../models/interfaces/shop'
import React, { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { Button, Switch, Typography } from 'antd'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

export const AddEditUser = ({
    isModalOpen,
    closeModal,
    onComplete,
    user,
    validateSchema,
    variation,
}: {
    user?: User
    isModalOpen: boolean
    closeModal: () => void
    onComplete: (result: User) => Promise<void>
    variation: 'PARTIAL' | 'CREATE' | 'FULL'
    validateSchema?: ObjectSchema<any, User>
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        getValues,
        setError,
        reset,
    } = useForm<User>({ resolver: yupResolver(validateSchema) })
    const { loggedUser } = useContext(AuthContext)
    useEffect(() => {
        const defaultValue = { ...user, phones: user?.phones || [] }
        reset(defaultValue)
        formRef.current?.reset()
    }, [isModalOpen, variation])

    const { data: shops } = useQuery('shops', getAllShops)

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>User</h3>
            <form
                ref={formRef}
                className='modalForm'
                onSubmit={handleSubmit((data) =>
                    onComplete(data).catch((message: string) => {
                        setError('root', { message })
                    })
                )}
            >
                <TextField
                    defaultValue={''}
                    register={register('username')}
                    error={errors.username}
                    label={'Username'}
                />
                <TextField
                    defaultValue={''}
                    register={register('fullName')}
                    error={errors.fullName}
                    label={'FullName'}
                />
                <TextField
                    defaultValue={''}
                    register={register('email')}
                    error={errors.email}
                    label={'Email'}
                    type='email'
                />
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
                <Controller
                    control={control}
                    name={'smsPermission'}
                    render={({ field, fieldState }) => (
                        <FormField label={'Receive sms notifications'} error={fieldState.error}>
                            <Switch checked={field.value} onChange={field.onChange} />
                        </FormField>
                    )}
                />
                <Controller
                    control={control}
                    name={'emailPermission'}
                    render={({ field, fieldState }) => (
                        <FormField label={'Receive email notifications'} error={fieldState.error}>
                            <Switch checked={field.value} onChange={field.onChange} />
                        </FormField>
                    )}
                />
                <Controller
                    control={control}
                    name={'isBanned'}
                    render={({ field, fieldState }) => (
                        <FormField label={'Ban status'} error={fieldState.error}>
                            <Switch checked={field.value} onChange={field.onChange} />
                        </FormField>
                    )}
                />

                {variation === 'FULL' && (
                    <>
                        <Controller
                            control={control}
                            name='shopId'
                            render={({ field, fieldState }) => (
                                <FormField error={fieldState.error} label='Shop'>
                                    <Select<Shop, false>
                                        theme={SelectTheme}
                                        options={shops}
                                        value={shops?.find((shop) => shop.id === field.value)}
                                        getOptionLabel={({ shopName }) => shopName}
                                        getOptionValue={({ id }) => id + ''}
                                        placeholder=''
                                        onChange={(item) => field.onChange(item?.id)}
                                    />
                                </FormField>
                            )}
                        />
                        <TextField
                            register={register('password')}
                            error={errors.password}
                            label={'New Password'}
                            placeholder='New Password'
                        />
                        <span>* Leave password field blank to keep the old password</span>
                        <Controller
                            control={control}
                            name='role'
                            render={({ field, fieldState }) => (
                                <FormField error={fieldState.error} label='Role'>
                                    <Select
                                        theme={SelectTheme}
                                        options={UserRolesArray}
                                        value={UserRolesArray.find((role) => role.value === field.value)}
                                        getOptionLabel={({ value }) => value}
                                        getOptionValue={({ value }) => value}
                                        placeholder='Select a role for the user'
                                        onChange={(item) => field.onChange(item?.value)}
                                    />
                                </FormField>
                            )}
                        />
                    </>
                )}
                {variation === 'CREATE' && (
                    <>
                        <FormField label='Shop'>
                            <input
                                className='input'
                                value={shops?.find((shop) => shop.id === loggedUser?.shopId)?.shopName}
                                readOnly
                            />
                        </FormField>
                        <Controller
                            control={control}
                            name='role'
                            render={({ field, fieldState }) => (
                                <FormField error={fieldState.error} label='Role'>
                                    <Select
                                        theme={SelectTheme}
                                        options={UserRolesArray}
                                        getOptionLabel={({ value }) => value}
                                        getOptionValue={({ value }) => value}
                                        placeholder=''
                                        onChange={(item) => field.onChange(item?.value)}
                                    />
                                </FormField>
                            )}
                        />
                    </>
                )}
                {variation === 'PARTIAL' && (
                    <TextField
                        register={register('password')}
                        error={errors.password}
                        placeholder='Old Password'
                        label={'Enter your password to authenticate yourself'}
                        type='password'
                    />
                )}
                <FormError error={errors.root?.message} />

                <div className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit'>
                        Save
                    </Button>
                    <Button htmlType='button' onClick={closeModal}>
                        Close
                    </Button>
                </div>
            </form>
        </AppModal>
    )
}
