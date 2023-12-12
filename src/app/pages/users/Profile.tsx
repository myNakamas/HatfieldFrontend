import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { ReactNode, useContext, useRef, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User } from '../../models/interfaces/user'
import { faUserLock } from '@fortawesome/free-solid-svg-icons'
import { changeProfilePicture, deletePersonalAccount, getProfilePicture } from '../../axios/http/userRequests'
import { toastProps, toastUpdatePromiseTemplate } from '../../components/modals/ToastProps'
import { toast } from 'react-toastify'
import { useQuery, useQueryClient } from 'react-query'
import { ProfileImageLarge } from '../../components/user/ProfileImage'
import { Button, Card, Image, Popconfirm, Space } from 'antd'
import { EditUser } from '../../components/modals/users/EditUser'
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload'
import { Text } from 'recharts'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'

export const Profile = () => {
    const uploadRef = useRef<HTMLInputElement>(null)
    const { loggedUser, logout } = useContext(AuthContext)
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
    const { data: profileImg, isLoading: isProfileImageLoading } = useQuery(
        ['profileImg', loggedUser?.userId],
        () => getProfilePicture({ id: loggedUser?.userId }),
        { retry: false }
    )

    const sendDeleteAccountRequest = () => {
        toast.promise(deletePersonalAccount, toastUpdatePromiseTemplate('profile'), toastProps).then(logout)
    }

    return (
        <>
            <div className='setting width-m'>
                {userToEdit && (
                    <EditUser user={userToEdit} isModalOpen={showModal} closeModal={() => setShowModal(false)} />
                )}
                <Card className='card' title={'Your info'}>
                    <Space wrap>
                        <ProfileImageLarge isLoading={isProfileImageLoading} profileImg={profileImg} />
                        <Image />
                        <div className='p-2 profileDesc'>
                            <p>Personalize your account with a photo:</p>
                            <input
                                ref={uploadRef}
                                id={'uploadProfilePic'}
                                type='file'
                                hidden={true}
                                onChange={(e) => uploadPicture(e.target.files)}
                            />
                            <Button
                                onClick={() => uploadRef.current?.click()}
                                icon={<FontAwesomeIcon icon={faUpload} />}
                            >
                                Upload a new image
                            </Button>
                            <Text fontSize={5}>The image size must not exceed 2Mb</Text>
                        </div>
                    </Space>

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

                    {loggedUser?.phones &&
                        loggedUser.phones.length > 0 &&
                        loggedUser.phones.map((phone, index) => (
                            <>
                                <SettingsRow key={'phone' + index} name={`Phone number ${index}.`} value={phone} />
                            </>
                        ))}
                    <SettingsRow name={'Email address'} value={loggedUser?.email} />
                    <SettingsRow name={'Role'} value={loggedUser?.role} />
                    <SettingsRow name={'Shop'} value={loggedUser?.shopName} />
                </SettingsCard>
                <Card title='Account control'>
                    <Space className={'flex-100 justify-between'}>
                        <h4>Account deletion</h4>
                        <p>Selecting this button will initiate the process of permanently deleting your account</p>
                        <Popconfirm
                            title={'Account deletion confirmation'}
                            description={'Are you sure you want to delete your account? This action is irreversible'}
                            onConfirm={() => {
                                sendDeleteAccountRequest()
                            }}
                            onCancel={() => toast.success('Thank you for changing your mind 😅')}
                        >
                            <Button type={'primary'} danger icon={<FontAwesomeIcon icon={faTrash} />}>
                                Delete account
                            </Button>
                        </Popconfirm>
                    </Space>
                </Card>
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
const SettingsRow = ({ name, value, extra }: { name: string; value: string | undefined; extra?: ReactNode }) => {
    return (
        <>
            <div className='flex-100 row'>
                <div className='name'>{name}</div>
                <div className='value'>{value}</div>
                {extra ? <div>{extra}</div> : <></>}
            </div>
        </>
    )
}
