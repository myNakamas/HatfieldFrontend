import { AppModal } from '../AppModal'
import { UserForm } from './UserForm'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { FormError } from '../../form/FormError'
import { Button, Switch } from 'antd'
import React, { useContext, useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getAllShops } from '../../../axios/http/shopRequests'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ClientSchema } from '../../../models/validators/FormValidators'
import { toast } from 'react-toastify'
import { updateClient } from '../../../axios/http/userRequests'
import { toastProps, toastUpdatePromiseTemplate } from '../ToastProps'
import { TextField } from '../../form/TextField'
import { AppError } from '../../../models/interfaces/generalModels'
import { Shop } from '../../../models/interfaces/shop'
import { AppSelect } from '../../form/AppSelect'

export const EditClient = ({
    client,
    isModalOpen,
    closeModal,
}: {
    client?: User
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { loggedUser, isAdmin, isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const { data: shops } = useQuery('shops', getAllShops, { enabled: isAdmin() })

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
    } = useForm<User>({
        resolver: yupResolver(ClientSchema),
        defaultValues: client,
    })
    useEffect(() => {
        formRef.current?.reset()
        reset(client)
    }, [isModalOpen])

    const onSaveNew = (formValue: User) => {
        const user = isAdmin() ? formValue : ({ ...formValue, shopId: loggedUser?.shopId } as User)
        return toast
            .promise(updateClient(user), toastUpdatePromiseTemplate('client'), toastProps)
            .then(() => {
                closeModal()
                queryClient.invalidateQueries(['users', 'clients']).then()
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title='Edit client ' isForbidden={!isWorker()}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit((data) => onSaveNew(data))}>
                <UserForm {...{ register, control, watch, setValue, getValues, errors }} />

                {isAdmin() && (
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
                <Controller
                    control={control}
                    name={'isBanned'}
                    render={({ field, fieldState }) => (
                        <FormField label={'User Ban Toggle'} error={fieldState.error}>
                            <Switch checked={field.value} onChange={field.onChange} />
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
