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

export const EditClient = ({
    client,
    isModalOpen,
    closeModal,
}: {
    client?: User
    isModalOpen: boolean
    closeModal: () => void
}) => {
    const { loggedUser, isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const { data: shops } = useQuery('shops', getAllShops, { enabled: loggedUser?.role === 'ADMIN' })

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
        const user = { ...formValue, shopId: loggedUser?.shopId } as User
        return (
            toast
                .promise(updateClient(user), toastUpdatePromiseTemplate('client'), toastProps)
                .then(() => {
                    closeModal()
                    queryClient.invalidateQueries(['users', 'clients']).then()
                })
                //todo: Refactor each catch to not work with just message, but whole object
                .catch((error: AppError) => {
                    setError('root', { message: error.detail })
                })
        )
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title='Edit client ' isForbidden={!isWorker()}>
            <form ref={formRef} className='modalForm' onSubmit={handleSubmit((data) => onSaveNew(data))}>
                <UserForm {...{ register, control, watch, setValue, getValues, errors }} />

                <FormField label='Shop'>
                    <input
                        className='input'
                        value={shops?.find((shop) => shop.id === loggedUser?.shopId)?.shopName}
                        readOnly
                    />
                </FormField>
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
