import { AppModal } from './AppModal'
import { User } from '../../models/interfaces/user'
import { Controller, FieldError, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup/dist/yup'
import { ObjectSchema } from 'yup'
import { TextField } from '../form/TextField'
import { UserRolesArray } from '../../models/enums/userEnums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { FormError } from '../form/FormError'
import Select from 'react-select'
import { FormField } from '../form/Field'
import { SelectTheme } from '../../styles/components/stylesTS'
import { useQuery } from 'react-query'
import { getAllShops } from '../../axios/http/shopRequests'
import { Shop } from '../../models/interfaces/shop'

export const EditTicket = ({
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
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        watch,
        setValue,
        getValues,
        setError,
    } = useForm<User>({ resolver: yupResolver(validateSchema), defaultValues: { ...user, password: '' } })
    const { data: shops } = useQuery('shops', getAllShops)

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>User</h3>
            <form
                className='modalForm'
                onSubmit={handleSubmit((data) =>
                    onComplete(data).catch((message: string) => {
                        setError('root', { message })
                    })
                )}
            >
                <TextField register={register('username')} error={errors.username} label={'Username'} />
                <TextField register={register('fullName')} error={errors.fullName} label={'FullName'} />
                <TextField register={register('email')} error={errors.email} label={'Email'} type='email' />
                <label>
                    Phones{' '}
                    <FontAwesomeIcon
                        size='lg'
                        color='green'
                        className=' clickable'
                        icon={faPlusCircle}
                        onClick={() => setValue('phones', [...getValues('phones'), ''])}
                    />
                </label>
                {watch('phones')?.map((phone, index) => {
                    const error = errors.phones && (errors.phones[index] as FieldError)
                    return (
                        <TextField
                            key={index}
                            register={register(`phones.${index}`)}
                            placeholder={'Add phone'}
                            error={error}
                            button={
                                <div className='icon-s clickable'>
                                    <FontAwesomeIcon
                                        color='red'
                                        icon={faTrash}
                                        onClick={() =>
                                            setValue(
                                                'phones',
                                                getValues('phones').filter((value, i) => i !== index)
                                            )
                                        }
                                    />
                                </div>
                            }
                        />
                    )
                })}
                {variation === 'FULL' ? (
                    <>
                        <Controller
                            control={control}
                            name='shopId'
                            render={({ field, fieldState }) => (
                                <FormField error={fieldState.error} label='Shop'>
                                    <Select<Shop, false>
                                        theme={SelectTheme}
                                        options={shops}
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
                                        getOptionLabel={({ value }) => value}
                                        getOptionValue={({ value }) => value}
                                        placeholder=''
                                        onChange={(item) => field.onChange(item?.value)}
                                    />
                                </FormField>
                            )}
                        />
                    </>
                ) : (
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
                    <button type='submit' className='successButton'>
                        Submit
                    </button>
                    <button className='cancelButton'>Cancel</button>
                </div>
            </form>
        </AppModal>
    )
}
