import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useState } from 'react'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { AuthContext } from '../../contexts/AuthContext'
import { ButtonProps } from '../../models/interfaces/generalModels'
import { Button } from '../../components/form/Button'
import { useNavigate } from 'react-router-dom'
import { AddEditUser } from '../../components/modals/AddEditUser'
import { User } from '../../models/interfaces/user'
import { SimpleUserSchema } from '../../models/validators/FormValidators'
import { faUserLock } from '@fortawesome/free-solid-svg-icons'

export const Profile = () => {
    const { loggedUser } = useContext(AuthContext)
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

    const userToEdit = loggedUser

    const removePhone = (index: number) => {
        console.log('todo: Delete phone number n' + index)
    }

    const onSubmit = (result: User) => {
        console.log(result)
    }

    return (
        <div className='setting'>
            <AddEditUser
                user={userToEdit}
                onComplete={onSubmit}
                variation='PARTIAL'
                validateSchema={SimpleUserSchema}
                isModalOpen={showModal}
                closeModal={() => setShowModal(false)}
            />
            <h2>Your info</h2>
            <div className='card'>
                <div className='flex justify-start '>
                    <div className='icon-xxl'>
                        <FontAwesomeIcon size='lg' icon={faUser} />
                    </div>
                    <div className='p-2 profileDesc'>
                        <p>Personalize your account with a photo:</p>
                        <button className='actionButton'>Change photo</button>
                    </div>
                </div>

                <SettingsRow name={'Full name'} value={loggedUser?.fullName} />
            </div>
            <SettingsCard
                header='Security'
                headerNode={
                    <button className='button' onClick={() => navigate('/profile/change-password')}>
                        <FontAwesomeIcon icon={faUserLock} /> Change password
                    </button>
                }
            />
            <SettingsCard
                header='Account info'
                headerNode={<Button content='Edit account' className='button' onAction={() => setShowModal(true)} />}
            >
                <SettingsRow name={'Email address'} value={loggedUser?.email} />
                {loggedUser?.phones &&
                    loggedUser.phones.length > 0 &&
                    loggedUser.phones.map((phone, index) => (
                        <SettingsRow
                            key={'phone' + index}
                            name={'Phone number'}
                            value={phone}
                            button={
                                index > 0 ? { content: 'Remove phone', onAction: () => removePhone(index) } : undefined
                            }
                        />
                    ))}
                <SettingsRow name={'Full name'} value={loggedUser?.fullName} />
                <SettingsRow name={'Full name'} value={loggedUser?.fullName} />
            </SettingsCard>
        </div>
    )
}
export const SettingsCard = ({
    headerNode,
    children,
    header,
}: {
    headerNode?: React.ReactNode
    header?: string
    children?: React.ReactNode
}) => {
    return (
        <div className='card'>
            {header && (
                <div className='flex justify-between align-start'>
                    <div className='header'>{header}</div>
                    <div>{headerNode}</div>
                </div>
            )}
            {children}
        </div>
    )
}
const SettingsRow = ({ button, name, value }: { button?: ButtonProps; name: string; value: string | undefined }) => {
    return (
        <div className='flex row'>
            <div className='name'>{name}</div>
            <div className='value'>{value}</div>
            <div>{button && <Button {...button} />}</div>
        </div>
    )
}
