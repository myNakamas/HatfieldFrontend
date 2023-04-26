import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User } from '../../models/interfaces/user'
import { faUserLock } from '@fortawesome/free-solid-svg-icons'
import { changeProfilePicture, getProfilePicture } from '../../axios/http/userRequests'
import { toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from 'react-query'
import { ProfileImage } from '../../components/user/ProfileImage'
import { Button, Card } from 'antd'
import { EditUser } from '../../components/modals/users/EditUser'

export const Profile = () => {
    const { loggedUser } = useContext(AuthContext)
    const queryClient = useQueryClient()
    const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

    const userToEdit = { ...loggedUser, password: '' } as User
    const uploadPicture = async (files: FileList | null) => {
        if (files && files.length > 0) {
            await toast.promise(changeProfilePicture({ picture: files[0] }), toastUpdatePromiseTemplate('picture'))
            await queryClient.invalidateQueries(['profileImg', loggedUser?.userId])
        }
    }
    const { data: profileImg } = useQuery(['profileImg', loggedUser?.userId], () =>
        getProfilePicture({ id: loggedUser?.userId })
    )

    return (
        <>
            <div className='setting'>
                {userToEdit && (
                    <EditUser user={userToEdit} isModalOpen={showModal} closeModal={() => setShowModal(false)} />
                )}
                <h2>Your info</h2>
                <Card className='card'>
                    <div className='flex-100 justify-start '>
                        <div className='icon-xxl'>
                            <ProfileImage profileImg={profileImg} />
                        </div>
                        <div className='p-2 profileDesc'>
                            <p>Personalize your account with a photo:</p>
                            <input
                                type='file'
                                className='actionButton'
                                onChange={(e) => uploadPicture(e.target.files)}
                            />
                        </div>
                    </div>

                    <SettingsRow name={'Full name'} value={loggedUser?.fullName} />
                </Card>
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
        </>
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
        <Card title={header} className='card' extra={headerNode}>
            {children}
        </Card>
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
