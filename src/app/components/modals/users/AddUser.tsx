import { AppModal } from '../AppModal'
import { User } from '../../../models/interfaces/user'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { TextField } from '../../form/TextField'
import { UserRolesArray } from '../../../models/enums/userEnums'
import { FormError } from '../../form/FormError'
import { FormField } from '../../form/Field'
import { useQuery, useQueryClient } from 'react-query'
import { getAllShops } from '../../../axios/http/shopRequests'
import { Shop } from '../../../models/interfaces/shop'
import React, { useContext, useEffect, useRef } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { Button, Space } from 'antd'
import { toast } from 'react-toastify'
import { createClient, createWorkerUser } from '../../../axios/http/userRequests'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { SimpleUserSchema } from '../../../models/validators/FormValidators'
import { UserForm } from './UserForm'
import { defaultUser } from '../../../models/enums/defaultValues'
import { AppError, ItemPropertyView } from '../../../models/interfaces/generalModels'
import { AppSelect } from '../../form/AppSelect'

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
                <Space wrap>
                    {isAdmin() ? (
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
                    ) : (
                        <FormField label='Shop'>
                            <AppSelect<number, Shop>
                                options={shops}
                                value={loggedUser?.shopId}
                                getOptionValue={(shop) => shop.id}
                                getOptionLabel={(shop) => shop.shopName}
                                disabled
                            />
                        </FormField>
                    )}

                    <Controller
                        control={control}
                        name='role'
                        render={({ field, fieldState }) => (
                            <FormField error={fieldState.error} label='Role'>
                                <AppSelect<string, ItemPropertyView>
                                    value={field.value}
                                    options={UserRolesArray}
                                    placeholder='Select the User Role'
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
