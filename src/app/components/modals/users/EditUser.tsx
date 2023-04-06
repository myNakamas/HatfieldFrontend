import { Button, Switch } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import React, { useContext, useEffect, useRef } from 'react'
import { AppModal } from '../AppModal'
import { User } from '../../../models/interfaces/user'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { EditUserSchema } from '../../../models/validators/FormValidators'
import { AuthContext } from '../../../contexts/AuthContext'
import { toast } from 'react-toastify'
import { updateClient, updateUser, updateYourProfile } from '../../../axios/http/userRequests'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { useQuery, useQueryClient } from 'react-query'
import { FormError } from '../../form/FormError'
import { UserForm } from './UserForm'
import { FormField } from '../../form/Field'
import Select from 'react-select'
import { Shop } from '../../../models/interfaces/shop'
import { SelectTheme } from '../../../styles/components/stylesTS'
import { TextField } from '../../form/TextField'
import { UserRolesArray } from '../../../models/enums/userEnums'
import { getAllShops } from '../../../axios/http/shopRequests'

export const EditUser = ({
    isModalOpen,
    closeModal,
    user,
}: {
    user?: User
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { data: shops } = useQuery('shops', getAllShops)
    const { loggedUser, setLoggedUser } = useContext(AuthContext)
    const isSelfEdit = () => loggedUser?.userId === user?.userId

    const formRef = useRef<HTMLFormElement>(null)
    const queryClient = useQueryClient()
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
    } = useForm<User>({ resolver: yupResolver(EditUserSchema) })
    useEffect(() => {
        const defaultValue = { ...user, phones: user?.phones || [] }
        reset(defaultValue)
        formRef.current?.reset()
    }, [isModalOpen])
    const onEdit = (user: User) =>
        toast
            .promise(
                user.role === 'CLIENT' ? updateClient(user) : updateUser(user),
                toastUpdatePromiseTemplate('user'),
                toastProps
            )
            .then(() => {
                closeModal()
                queryClient.invalidateQueries(['users']).then()
            })
            .catch((message: string) => {
                setError('root', { message })
            })
    const onSelfEdit = (user: User) => {
        toast
            .promise(updateYourProfile(user), toastUpdatePromiseTemplate('user'), toastProps)
            .then((updatedUser) => {
                setLoggedUser(updatedUser)
                closeModal()
            })
            .catch((message: string) => {
                setError('root', { message })
            })
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>User</h3>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit(isSelfEdit() ? onSelfEdit : onEdit)}>
                <TextField
                    defaultValue={''}
                    register={register('username')}
                    error={errors.username}
                    label={'Username'}
                />
                <UserForm {...{ register, control, watch, setValue, getValues, errors }} />

                {!isSelfEdit() && (
                    <>
                        <Controller
                            control={control}
                            name={'isBanned'}
                            render={({ field, fieldState }) => (
                                <FormField label={'Ban status'} error={fieldState.error}>
                                    <Switch checked={field.value} onChange={field.onChange} />
                                </FormField>
                            )}
                        />
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
