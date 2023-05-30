import { AppModal } from '../AppModal'
import { User } from '../../../models/interfaces/user'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { TextField } from '../../form/TextField'
import { WorkerRolesArray } from '../../../models/enums/userEnums'
import { FormError } from '../../form/FormError'
import Select from 'react-select'
import { FormField } from '../../form/Field'
import { SelectTheme } from '../../../styles/components/stylesTS'
import { useQuery, useQueryClient } from 'react-query'
import { getAllShops } from '../../../axios/http/shopRequests'
import { Shop } from '../../../models/interfaces/shop'
import React, { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { Button } from 'antd'
import { toast } from 'react-toastify'
import { createClient, createWorkerUser } from '../../../axios/http/userRequests'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { SimpleUserSchema } from '../../../models/validators/FormValidators'
import { UserForm } from './UserForm'
import { defaultUser } from '../../../models/enums/defaultValues'
import { AppError } from '../../../models/interfaces/generalModels'

export const AddUser = ({ isModalOpen, closeModal }: { isModalOpen: boolean; closeModal: () => void }) => {
    const formRef = useRef<HTMLFormElement>(null)
    const { data: shops } = useQuery('shops', getAllShops)
    const { loggedUser, isAdmin } = useContext(AuthContext)

    const queryClient = useQueryClient()
    const defaultValues = isAdmin() ? defaultUser : { ...defaultUser, shopId: loggedUser?.shopId }
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
    } = useForm<User>({
        resolver: yupResolver(SimpleUserSchema),
        defaultValues,
    })
    useEffect(() => {
        formRef.current?.reset()
        reset(defaultValues)
    }, [isModalOpen])

    const onSaveNew = (formValue: User) => {
        const user = isAdmin() ? formValue : ({ ...formValue, shopId: loggedUser?.shopId } as User)
        return toast
            .promise(
                user.role === 'CLIENT' ? createClient(user) : createWorkerUser(user),
                toastCreatePromiseTemplate('user'),
                toastProps
            )
            .then(() => {
                closeModal()
                reset({})
                queryClient.invalidateQueries(['users']).then()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title={'User'}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit((data) => onSaveNew(data))}>
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
                    label={'Full name'}
                />
                <UserForm {...{ register, control, watch, setValue, getValues, errors }} />
                {isAdmin() ? (
                    <Controller
                        control={control}
                        name='shopId'
                        render={({ field, fieldState }) => (
                            <FormField error={fieldState.error} label='Shop'>
                                <Select<Shop, false>
                                    theme={SelectTheme}
                                    options={shops}
                                    value={shops?.find((shop) => shop.id === field.value) ?? null}
                                    getOptionLabel={({ shopName }) => shopName}
                                    getOptionValue={({ id }) => id + ''}
                                    placeholder=''
                                    onChange={(item) => field.onChange(item?.id)}
                                />
                            </FormField>
                        )}
                    />
                ) : (
                    <FormField label='Shop'>
                        <input
                            className='input'
                            value={shops?.find((shop) => shop.id === loggedUser?.shopId)?.shopName}
                            readOnly
                        />
                    </FormField>
                )}

                <Controller
                    control={control}
                    name='role'
                    render={({ field, fieldState }) => (
                        <FormField error={fieldState.error} label='Role'>
                            <Select
                                theme={SelectTheme}
                                options={WorkerRolesArray}
                                getOptionLabel={({ value }) => value}
                                getOptionValue={({ value }) => value}
                                placeholder=''
                                value={WorkerRolesArray.find((role) => role.value === field.value) ?? null}
                                onChange={(item) => field.onChange(item?.value)}
                            />
                        </FormField>
                    )}
                />
                <TextField
                    register={register('password')}
                    error={errors.password}
                    placeholder='Type a new password'
                    label={'Password'}
                    type='password'
                />
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
