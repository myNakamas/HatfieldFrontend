import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { capitalizeFirst } from '../../utils/helperFunctions'
import { Dropdown, MenuProps } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faSignOut } from '@fortawesome/free-solid-svg-icons'

export const ProfileDropdown = () => {
    const { loggedUser, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    const items: MenuProps['items'] = [
        {
            label: 'Settings',
            key: '/settings',
            icon: <FontAwesomeIcon icon={faCogs} />,
            onClick: () => navigate('/settings'),
        },
        {
            label: 'Sign out',
            key: '/logout',
            icon: <FontAwesomeIcon icon={faSignOut} />,
            onClick: () => {
                logout()
                navigate('/logout')
            },
        },
    ]
    return (
        <Dropdown menu={{ items }} arrow>
            <div className='menu '>
                <div className='username'>{capitalizeFirst(loggedUser?.username)}</div>
                <div className='role'>{loggedUser?.role}</div>
            </div>
        </Dropdown>
    )
}
