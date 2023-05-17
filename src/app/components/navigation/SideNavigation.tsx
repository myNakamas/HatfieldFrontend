import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { faDashboard } from '@fortawesome/free-solid-svg-icons/faDashboard'
import React, { useContext } from 'react'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'
import {
    faBuildingUser,
    faClockRotateLeft,
    faFileInvoice,
    faPersonCircleQuestion,
} from '@fortawesome/free-solid-svg-icons'
import { Drawer, Menu, MenuProps, Space, Typography } from 'antd'
import { WebSocketContext } from '../../contexts/WebSocketContext'

export type MenuItem = Required<MenuProps>['items'][number]

export const SideNavigation = ({
    showNavigation,
    setShowNav,
}: {
    showNavigation?: boolean
    setShowNav: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const { notificationCount } = useContext(WebSocketContext)
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const totalNotificationCount = Object.values(notificationCount).reduce((a, b) => a + b, 0)
    const items: MenuItem[] = [
        { label: 'Home', key: '/welcome', icon: <FontAwesomeIcon icon={faHouse} /> },
        { label: 'Dashboard', key: '/dashboard', icon: <FontAwesomeIcon icon={faDashboard} /> },
        { label: 'Inventory', key: '/inventory', icon: <FontAwesomeIcon icon={faStore} /> },
        { label: 'Workers', key: '/workers', icon: <FontAwesomeIcon icon={faUserShield} /> },
        { label: 'Shops', key: '/shops', icon: <FontAwesomeIcon icon={faBuildingUser} /> },
        { label: 'Clients', key: '/clients', icon: <FontAwesomeIcon icon={faUsers} /> },
        { label: 'Tickets', key: '/tickets', icon: <FontAwesomeIcon icon={faTicket} /> },
        { label: 'Invoices', key: '/invoices', icon: <FontAwesomeIcon icon={faFileInvoice} /> },
        {
            label: 'Chats',
            key: '/chats',
            icon: (
                <Space className={'sideNavIcon'}>
                    <FontAwesomeIcon icon={faCommentDots} />
                    {totalNotificationCount > 0 && (
                        <Typography className={'icon-s abs-icon'}>{totalNotificationCount}</Typography>
                    )}
                </Space>
            ),
        },
        {
            label: 'Logs',
            key: '/logs',
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        },
        {
            label: 'About us',
            key: '/about',
            icon: <FontAwesomeIcon icon={faPersonCircleQuestion} />,
        },
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
                selectedKeys={[pathname]}
                onClick={(item) => {
                    navigate(item.key)
                }}
                onSelect={() => setShowNav(false)}
                mode='inline'
                items={items}
            />
        </Drawer>
    )
}
