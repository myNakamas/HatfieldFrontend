import {
    faBuildingUser,
    faChartColumn,
    faClockRotateLeft,
    faCubes,
    faFileInvoice,
    faPersonCircleQuestion,
    faShoppingBasket,
    faTag,
} from '@fortawesome/free-solid-svg-icons'
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { faStore } from '@fortawesome/free-solid-svg-icons/faStore'
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield'
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Drawer, Menu, MenuProps } from 'antd'
import Button from 'antd/es/button'
import React, { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'
import { WebSocketContext } from '../../contexts/WebSocketContext'
import { ChatBadge } from '../ChatBadge'

export type MenuItem = Required<MenuProps>['items'][number]

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
    const totalNotificationCount = notificationCount?.totalCount ?? 0
    const ClientLinks: MenuItem[] = [
        { label: 'Tickets', key: '/tickets', icon: <FontAwesomeIcon icon={faTicket} /> },

        {
            label: 'Chats',
            key: '/chats',
            icon: (
                <ChatBadge ticketId={totalNotificationCount}>
                    <FontAwesomeIcon icon={faCommentDots} />
                </ChatBadge>
            ),
        },
    ]
    const WorkerLinks: MenuItem[] = [
        { label: 'Clients', key: '/clients', icon: <FontAwesomeIcon icon={faUsers} /> },
        { label: 'Prices', key: '/prices', icon: <FontAwesomeIcon icon={faTag} /> },
        {
            label: 'Inventory',
            key: '/items',
            icon: <FontAwesomeIcon icon={faStore} />,
            children: [
                { label: 'Items', key: '/inventory', icon: <FontAwesomeIcon icon={faStore} /> },
                { label: 'Categories', key: '/categories', icon: <FontAwesomeIcon icon={faCubes} /> },
                {
                    label: 'Shopping list',
                    key: `/inventory/${loggedUser?.shopId}/shopping-list`,
                    icon: <FontAwesomeIcon icon={faShoppingBasket} />,
                },
            ],
        },
        ...ClientLinks,
        { label: 'Invoices', key: '/invoices', icon: <FontAwesomeIcon icon={faFileInvoice} /> },
    ]
    const WorkerLinks2: MenuItem[] = [
        { label: 'Statistics', key: '/stats', icon: <FontAwesomeIcon icon={faChartColumn} /> },
        {
            label: 'Logs',
            key: '/logs',
            icon: <FontAwesomeIcon icon={faClockRotateLeft} />,
        },
    ]
    const AdminLinks: MenuItem[] = [
        { label: 'Workers', key: '/workers', icon: <FontAwesomeIcon icon={faUserShield} /> },
        ...WorkerLinks,
        { label: 'Shops', key: '/shops', icon: <FontAwesomeIcon icon={faBuildingUser} /> },
        ...WorkerLinks2,
    ]

    const items: MenuItem[] = [
        { label: 'Home', key: '/home', icon: <FontAwesomeIcon icon={faHouse} /> },
        ...(isAdmin() ? AdminLinks : isWorker() ? WorkerLinks.concat(WorkerLinks2) : ClientLinks),
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
            styles={{ body: { padding: 0 } }}
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
                    <Button
                        aria-label='Open drawer'
                        style={{ position: 'absolute', bottom: 20, right: 20 }}
                        icon={<FontAwesomeIcon icon={faCogs} />}
                        onClick={() => {
                            navigate(`/shops/${loggedUser?.shopId}`)
                            setShowNav(false)
                        }}
                    >
                        Shop settings
                    </Button>
                )}
            </div>
        </Drawer>
    )
}
