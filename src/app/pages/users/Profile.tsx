import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { AddEditUser } from '../../components/modals/AddEditUser'
import { User } from '../../models/interfaces/user'
import { SimpleUserSchema } from '../../models/validators/FormValidators'
import { faUserLock } from '@fortawesome/free-solid-svg-icons'
import { changeProfilePicture, getProfilePicture, updateYourProfile } from '../../axios/http/userRequests'
import { toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from 'react-query'
import { ProfileImage } from '../../components/user/ProfileImage'
import { Button } from 'antd'

export const Profile = () => {
    const { loggedUser, setLoggedUser } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

    const userToEdit = { ...loggedUser, password: '' } as User
    const onSubmit = (result: User) => {
        return updateYourProfile(result).then((updatedUser) => {
            setLoggedUser(updatedUser)
            setShowModal(false)
        })
    }
    const uploadPicture = async (files: FileList | null) => {
        if (files && files.length > 0) {
            await toast.promise(changeProfilePicture({ picture: files[0] }), toastUpdatePromiseTemplate('picture'))
            await queryClient.invalidateQueries(['profileImg', loggedUser?.userId])
        }
    }
    const { data: profileImg } = useQuery(['profileImg', loggedUser?.userId], () =>
        getProfilePicture({ id: loggedUser?.userId ?? '' })
    )

    return (
        <div className='setting'>
            {userToEdit && (
                <AddEditUser
                    user={userToEdit}
                    isModalOpen={showModal}
                    onComplete={(result) => onSubmit(result)}
                    variation='PARTIAL'
                    validateSchema={SimpleUserSchema}
                    closeModal={() => setShowModal(false)}
                />
            )}
            <h2>Your info</h2>
            <div className='card'>
                <div className='flex-100 justify-start '>
                    <div className='icon-xxl'>
                        <ProfileImage profileImg={profileImg} />
                    </div>
                    <div className='p-2 profileDesc'>
                        <p>Personalize your account with a photo:</p>
                        <input type='file' className='actionButton' onChange={(e) => uploadPicture(e.target.files)} />
                    </div>
                </div>

                <SettingsRow name={'Full name'} value={loggedUser?.fullName} />
            </div>
            <SettingsCard
                header='Security'
                headerNode={
                    <Button
                        icon={<FontAwesomeIcon icon={faUserLock} />}
                        onClick={() => navigate('/profile/change-password')}
                    >
                        Change password
                    </Button>
                }
            />
            <SettingsCard
                header='Account info'
                headerNode={<Button onClick={() => setShowModal(true)}>Edit account</Button>}
            >
                <SettingsRow name={'Username'} value={loggedUser?.username} />

                <SettingsRow name={'Email address'} value={loggedUser?.email} />

                {loggedUser?.phones &&
                    loggedUser.phones.length > 0 &&
                    loggedUser.phones.map((phone, index) => (
                        <SettingsRow key={'phone' + index} name={'Phone number'} value={phone} />
                    ))}
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
                <div className='flex-100 header'>
                    <div>{header}</div>
                    {headerNode}
                </div>
            )}
            {children}
        </div>
    )
}
const SettingsRow = ({ name, value }: { name: string; value: string | undefined }) => {
    return (
        <div className='flex-100 row'>
            <div className='name'>{name}</div>
            <div className='value'>{value}</div>
        </div>
    )
}
