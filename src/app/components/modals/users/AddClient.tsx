import { AppModal } from '../AppModal'
import { UserForm } from './UserForm'
import { Controller, useForm } from 'react-hook-form'
import { FormField } from '../../form/Field'
import { FormError } from '../../form/FormError'
import { Button, Typography } from 'antd'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { getAllShops } from '../../../axios/http/shopRequests'
import { AuthContext } from '../../../contexts/AuthContext'
import { User } from '../../../models/interfaces/user'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ClientSchema } from '../../../models/validators/FormValidators'
import { getDefaultClient } from '../../../models/enums/defaultValues'
import { toast } from 'react-toastify'
import { createClient } from '../../../axios/http/userRequests'
import { toastCreatePromiseTemplate, toastProps } from '../ToastProps'
import { TextField } from '../../form/TextField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faPrint } from '@fortawesome/free-solid-svg-icons'
import { printUserLabel } from '../../../axios/http/documentRequests'
import { AppError } from '../../../models/interfaces/generalModels'
import { Shop } from '../../../models/interfaces/shop'
import { AppSelect } from '../../form/AppSelect'

export const AddClient = ({
    isModalOpen,
    closeModal,
    onSuccess,
}: {
    isModalOpen: boolean
    closeModal: () => void
    onSuccess?: (user: User) => void
}) => {
    const { loggedUser, isAdmin, isWorker } = useContext(AuthContext)
    const formRef = useRef<HTMLFormElement>(null)
    const [showResponse, setShowResponse] = useState<User | undefined>()
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
        defaultValues: getDefaultClient(loggedUser?.shopId),
    })
    useEffect(() => {
        reset()
        formRef.current?.reset()
        setShowResponse(undefined)
    }, [isModalOpen])

    const onSaveNew = (formValue: User) => {
        const user = isAdmin() ? formValue : ({ ...formValue, shopId: loggedUser?.shopId } as User)
        return toast
            .promise(createClient(user), toastCreatePromiseTemplate('client'), toastProps)
            .then((user) => {
                setShowResponse(user)
                queryClient.invalidateQueries(['users', 'clients']).then(() => {
                    onSuccess && onSuccess(user)
                })
            })
            .catch((error: AppError) => {
                setError('root', { message: error.detail })
            })
    }

    return (
        <AppModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            title='Create a new client'
            size='S'
            isForbidden={!isWorker()}
        >
            {showResponse ? (
                <Typography style={{ textAlign: 'left' }}>
                    <h4>Username:</h4>
                    <p>{showResponse.username}</p>
                    <h4>Password:</h4>
                    <p>{showResponse.firstPass}</p>
                    <Button.Group>
                        <Button
                            icon={<FontAwesomeIcon icon={faPrint} />}
                            onClick={() => printUserLabel(showResponse?.userId, true)}
                        >
                            Print user label
                        </Button>
                        <Button
                            icon={<FontAwesomeIcon icon={faEye} />}
                            onClick={() => printUserLabel(showResponse?.userId, false)}
                        >
                            Print user label
                        </Button>
                    </Button.Group>
                </Typography>
            ) : (
                <form ref={formRef} className='modalForm' onSubmit={handleSubmit(onSaveNew)} id={'addClientForm'}>
                    <TextField
                        defaultValue={''}
                        register={register('fullName')}
                        error={errors.fullName}
                        label={'Full name'}
                    />
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

                    <FormError error={errors.root?.message} />

                    <div className='flex-100 justify-end'>
                        <Button type='primary' htmlType='submit' form={'addClientForm'}>
                            Save
                        </Button>
                        <Button htmlType='button' onClick={closeModal}>
                            Close
                        </Button>
                    </div>
                </form>
            )}
        </AppModal>
    )
}
