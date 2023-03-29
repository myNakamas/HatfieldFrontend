import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs'
import { faDashboard } from '@fortawesome/free-solid-svg-icons/faDashboard'
import React from 'react'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'
import { faBuildingUser } from '@fortawesome/free-solid-svg-icons'
import { Drawer, Menu, MenuProps } from 'antd'

export const SideNavigation = ({
    showNavigation,
    setShowNav,
}: {
    showNavigation?: boolean
    setShowNav: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const navigate = useNavigate()
    type MenuItem = Required<MenuProps>['items'][number]

    const items: MenuItem[] = [
        { label: 'Home', key: '/welcome', icon: <FontAwesomeIcon icon={faHouse} /> },
        { label: 'Dashboard', key: '/dashboard', icon: <FontAwesomeIcon icon={faDashboard} /> },
        { label: 'Inventory', key: '/inventory', icon: <FontAwesomeIcon icon={faStore} /> },
        { label: 'Users', key: '/users', icon: <FontAwesomeIcon icon={faUserShield} /> },
        { label: 'Shops', key: '/shops', icon: <FontAwesomeIcon icon={faBuildingUser} /> },
        { label: 'Clients', key: '/clients', icon: <FontAwesomeIcon icon={faUsers} /> },
        { label: 'Chats', key: '/chats', icon: <FontAwesomeIcon icon={faCommentDots} /> },
        { label: 'Tickets', key: '/tickets', icon: <FontAwesomeIcon icon={faTicket} /> },
        { label: 'Home', key: '/', icon: <FontAwesomeIcon icon={faTicket} /> },
        { label: 'Settings', key: '/settings', icon: <FontAwesomeIcon icon={faCogs} /> },
    ]

    return (
        <Drawer
            title='Hatfield'
            placement={'left'}
            closable={true}
            bodyStyle={{ padding: 0 }}
            onClose={() => setShowNav(false)}
            open={showNavigation}
        >
            <Menu
                onSelect={(item) => {
                    navigate(item.key)
                }}
                mode='inline'
                items={items}
            />
        </Drawer>
    )
}
