import { AppModal } from "./AppModal";
import { User } from "../../models/interfaces/user";
import { FieldError, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup/dist/yup";
import { ObjectSchema } from "yup";
import { TextField } from "../form/TextField";
import { FormSelect } from "../form/FormSelect";
import { UserRolesArray } from "../../models/enums/userEnums";
import { AppOption } from "../../models/interfaces/generalModels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons/faPlusCircle";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { FormError } from "../form/FormError";

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
    variation: 'PARTIAL' | 'FULL'
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
    } = useForm<User>({ resolver: yupResolver(validateSchema), defaultValues: { ...user,password:'' } })

    return (
        <AppModal isModalOpen={isModalOpen} closeModal={closeModal}>
            <h3>User</h3>
            <form
                className='modalForm'
                onSubmit={handleSubmit((data) =>
                    onComplete(data).catch((message:string) => {
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
                    //todo: generate password button that generates it
                    <>
                        <TextField
                            register={register('password')}
                            error={errors.password}
                            label={'New Password'}
                            placeholder='New Password'
                        />
                        <span>Leave password field blank to keep the old password</span>
                        <FormSelect<AppOption>
                            options={UserRolesArray}
                            label='role'
                            control={control}
                            name='role'
                            getOptionLabel={({ value }) => value}
                            getOptionValue={({ value }) => value}
                            transformResult={(item) => item?.value}
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

                <div className='flex justify-end'>
                    <button type='submit' className='successButton'>
                        Submit
                    </button>
                    <button className='cancelButton'>Cancel</button>
                </div>
            </form>
        </AppModal>
    )
}
