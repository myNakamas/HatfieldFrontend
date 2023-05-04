import { AppModal } from '../AppModal'
import { UserForm } from './UserForm'
import { useForm } from 'react-hook-form'
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
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { printUserLabel } from '../../../axios/http/documentRequests'

export const AddClient = ({
    isModalOpen,
    closeModal,
    onSuccess,
}: {
    isModalOpen: boolean
    closeModal: () => void
    onSuccess?: (user: User) => void
}) => {
    const formRef = useRef<HTMLFormElement>(null)
    const [showResponse, setShowResponse] = useState<User | undefined>()
    const { data: shops } = useQuery('shops', getAllShops)
    const { loggedUser } = useContext(AuthContext)

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
        const user = { ...formValue, shopId: loggedUser?.shopId } as User
        return toast
            .promise(createClient(user), toastCreatePromiseTemplate('client'), toastProps)
            .then((user) => {
                setShowResponse(user)
                queryClient.invalidateQueries(['users', 'clients']).then(() => {
                    onSuccess && onSuccess(user)
                })
            })
            .catch((message: string) => {
                setError('root', { message })
            })
    }

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal} title='Create a new client' size='S'>
            {showResponse ? (
                <Typography style={{ textAlign: 'left' }}>
                    <h4>Username:</h4>
                    <p>{showResponse.username}</p>
                    <h4>Password:</h4>
                    <p>{showResponse.firstPass}</p>
                    <Button
                        icon={<FontAwesomeIcon icon={faPrint} />}
                        onClick={() => printUserLabel(showResponse?.userId)}
                    >
                        Print user label
                    </Button>
                </Typography>
            ) : (
                <form ref={formRef} className='modalForm' onSubmit={handleSubmit(onSaveNew)} id={'addClientForm'}>
                    <TextField
                        defaultValue={''}
                        register={register('fullName')}
                        error={errors.fullName}
                        label={'FullName'}
                    />
                    <UserForm {...{ register, control, watch, setValue, getValues, errors }} />
                    {loggedUser?.role === 'ADMIN' && (
                        <FormField label='Shop to add the client to'>
                            <input
                                className='input'
                                value={shops?.find((shop) => shop.id === loggedUser?.shopId)?.shopName}
                                readOnly
                            />
                        </FormField>
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
