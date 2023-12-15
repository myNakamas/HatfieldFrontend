import React, { useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { capitalizeFirst } from '../../utils/helperFunctions'
import { Dropdown, MenuProps, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faSignOut } from '@fortawesome/free-solid-svg-icons'
import ProfileImage from './ProfileImage'
import { useQuery } from 'react-query'
import { getProfilePicture } from '../../axios/http/userRequests'

export const ProfileDropdown = () => {
    const { loggedUser, logout } = useContext(AuthContext)
    const [smallScreen, setSmallScreen] = useState<boolean>(window.innerWidth < 768)
    window.addEventListener('resize', () => setSmallScreen(window.innerWidth < 768))
    const navigate = useNavigate()
    const { data: profileImg, isLoading } = useQuery(
        ['profileImg', loggedUser?.userId],
        () => getProfilePicture({ id: loggedUser?.userId }),
        { retry: false, retryOnMount:false }
    )
    const items: MenuProps['items'] = [
        {
            label: 'Settings',
            key: '/settings',
            icon: <FontAwesomeIcon icon={faCogs} />,
            onClick: () => navigate('/profile'),
        },
        {
            label: 'Sign out',
            key: '/logout',
            icon: <FontAwesomeIcon icon={faSignOut} />,
            onClick: () => {
                logout()
            },
        },
    ]
    return (
        <Dropdown menu={{ items }} arrow>
            <Space>
                <ProfileImage profileImg={profileImg} isLoading={isLoading} />
                {!smallScreen && (
                    <div className='menu '>
                        <div className='username'>{capitalizeFirst(loggedUser?.username)}</div>
                        <div className='role'>{loggedUser?.role}</div>
                    </div>
                )}
            </Space>
        </Dropdown>
    )
}
