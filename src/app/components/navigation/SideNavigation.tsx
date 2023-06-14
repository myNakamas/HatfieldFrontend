import { useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import React, { useContext } from 'react'
import {
    faBuildingUser,
    faClockRotateLeft,
    faFileInvoice,
    faPersonCircleQuestion,
} from '@fortawesome/free-solid-svg-icons'
import { Badge, Drawer, Menu, MenuProps, Space } from 'antd'
import { WebSocketContext } from '../../contexts/WebSocketContext'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers'
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { AuthContext } from '../../contexts/AuthContext'
import Button from 'antd/es/button'
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs'

export type MenuItem = Required<MenuProps>['items'][number]

const AdminLinks: MenuItem[] = [
    { label: 'Workers', key: '/workers', icon: <FontAwesomeIcon icon={faUserShield} /> },
    { label: 'Shops', key: '/shops', icon: <FontAwesomeIcon icon={faBuildingUser} /> },
]
const WorkerLinks: MenuItem[] = [
    { label: 'Inventory', key: '/inventory', icon: <FontAwesomeIcon icon={faStore} /> },
    { label: 'Clients', key: '/clients', icon: <FontAwesomeIcon icon={faUsers} /> },
    { label: 'Invoices', key: '/invoices', icon: <FontAwesomeIcon icon={faFileInvoice} /> },
    {
        label: 'Logs',
        key: '/logs',
        icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
    },
]

export const SideNavigation = ({
    showNavigation,
    setShowNav,
}: {
    showNavigation?: boolean
    setShowNav: React.Dispatch<React.SetStateAction<boolean>>
}) => {
    const { notificationCount } = useContext(WebSocketContext)
    const { loggedUser, isWorker, isAdmin } = useContext(AuthContext)
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const totalNotificationCount = Object.values(notificationCount).reduce((a, b) => a + b, 0)
    const items: MenuItem[] = [
        { label: 'Home', key: '/home', icon: <FontAwesomeIcon icon={faHouse} /> },
        { label: 'Tickets', key: '/tickets', icon: <FontAwesomeIcon icon={faTicket} /> },
        {
            label: 'Chats',
            key: '/chats',
            icon: (
                <Space className={'sideNavIcon'}>
                    <Badge count={totalNotificationCount}>
                        <FontAwesomeIcon icon={faCommentDots} />
                    </Badge>
                </Space>
            ),
        },
        ...(isAdmin() ? AdminLinks : []),
        ...(isWorker() ? WorkerLinks : []),
        {
            label: 'About us',
            key: '/about',
            icon: <FontAwesomeIcon icon={faPersonCircleQuestion} />,
        },
    ]

    return (
        <Drawer
            title={loggedUser?.shopName}
            placement={'left'}
            closable={true}
            bodyStyle={{ padding: 0 }}
            onClose={() => setShowNav(false)}
            open={showNavigation}
        >
            <div className='sideNav' style={{ height: '100%' }}>
                <Menu
                    selectedKeys={[pathname]}
                    onClick={(item) => {
                        navigate(item.key)
                    }}
                    onSelect={() => setShowNav(false)}
                    mode='inline'
                    items={items}
                />

                {isAdmin() && (
                    <Space className={'justify-around mb-1'}>
                        <Button
                            icon={<FontAwesomeIcon icon={faCogs} />}
                            onClick={() => {
                                navigate(`/shops/${loggedUser?.shopId}`)
                                setShowNav(false)
                            }}
                        >
                            Shop settings
                        </Button>
                    </Space>
                )}
            </div>
        </Drawer>
    )
}
