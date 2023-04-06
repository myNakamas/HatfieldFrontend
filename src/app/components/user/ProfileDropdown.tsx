import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { capitalizeFirst } from '../../utils/helperFunctions'
import { Avatar, Dropdown, MenuProps, Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faSignOut } from '@fortawesome/free-solid-svg-icons'
import { ProfileImage } from './ProfileImage'
import { useQuery } from 'react-query'
import { getProfilePicture } from '../../axios/http/userRequests'

export const ProfileDropdown = () => {
    const { loggedUser, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const { data: profileImg } = useQuery(['profileImg', loggedUser?.userId], () =>
        getProfilePicture({ id: loggedUser?.userId })
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
                <div className='icon-s'>
                    <Avatar icon={<ProfileImage profileImg={profileImg} />} />
                </div>
                <div className='menu '>
                    <div className='username'>{capitalizeFirst(loggedUser?.username)}</div>
                    <div className='role'>{loggedUser?.role}</div>
                </div>
            </Space>
        </Dropdown>
    )
}
