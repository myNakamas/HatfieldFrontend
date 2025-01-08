import { Button, Space, Switch } from 'antd'
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
import { Shop } from '../../../models/interfaces/shop'
import { TextField } from '../../form/TextField'
import { UserRolesArray } from '../../../models/enums/userEnums'
import { getAllShops } from '../../../axios/http/shopRequests'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { AppSelect } from '../../form/AppSelect'

export const EditUser = ({
    isModalOpen,
    closeModal,
    user,
}: {
    user?: User
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { loggedUser, setLoggedUser } = useContext(AuthContext)
    const isSelfEdit = () => loggedUser?.userId === user?.userId
    const { data: shops } = useQuery('shops', getAllShops, { enabled: !isSelfEdit() || loggedUser?.role === 'ADMIN' })

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
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    const onSelfEdit = (user: User) => {
        toast
            .promise(updateYourProfile(user), toastUpdatePromiseTemplate('user'), toastProps)
            .then((updatedUser) => {
                setLoggedUser(updatedUser)
                closeModal()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>User</h3>
            <form
                ref={formRef}
                className='modalForm'
                onSubmit={handleSubmit(isSelfEdit() ? onSelfEdit : onEdit, (errors) => {
                    console.log(watch(), errors)
                })}
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
                    label={'Full name'}
                />
                <UserForm {...{ register, control, watch, setValue, getValues, errors }} />
                {isSelfEdit() && loggedUser?.role === 'ADMIN' && (
                    <Controller
                        control={control}
                        name='shopId'
                        render={({ field, fieldState }) => (
                            <FormField error={fieldState.error} label='Shop'>
                                <AppSelect<number, Shop>
                                    value={field.value}
                                    options={shops}
                                    placeholder='Assign to shop'
                                    onChange={(shopId) => field.onChange(shopId)}
                                    getOptionLabel={(shop) => shop.shopName}
                                    getOptionValue={(shop) => shop.id}
                                />
                            </FormField>
                        )}
                    />
                )}
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
                        <Space wrap>
                            <Controller
                                control={control}
                                name='shopId'
                                render={({ field, fieldState }) => (
                                    <FormField error={fieldState.error} label='Shop'>
                                        <AppSelect<number, Shop>
                                            value={field.value}
                                            options={shops}
                                            placeholder='Assign to shop'
                                            onChange={(shopId) => field.onChange(shopId)}
                                            getOptionLabel={(shop) => shop.shopName}
                                            getOptionValue={(shop) => shop.id}
                                        />
                                    </FormField>
                                )}
                            />
                            <Controller
                                control={control}
                                name='role'
                                render={({ field, fieldState }) => (
                                    <FormField error={fieldState.error} label='Role'>
                                        <AppSelect<string, ItemPropertyView>
                                            value={field.value}
                                            options={UserRolesArray}
                                            placeholder='Select User Role'
                                            onChange={field.onChange}
                                            getOptionLabel={(role) => role.value}
                                            getOptionValue={(role) => role.value}
                                        />
                                    </FormField>
                                )}
                            />
                        </Space>

                        <TextField
                            register={register('password')}
                            error={errors.password}
                            label={'New Password'}
                            placeholder='New Password'
                        />
                        <span>* Leave password field blank to keep the old password</span>
                    </>
                )}

                <FormError error={errors.root?.message} />

                <Space className='flex-100 justify-end'>
                    <Button type='primary' htmlType='submit'>
                        Save
                    </Button>
                    <Button htmlType='button' onClick={closeModal}>
                        Close
                    </Button>
                </Space>
            </form>
        </AppModal>
    )
}
