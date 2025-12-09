import { PhoneOutlined } from '@ant-design/icons'
import { faBars, faLocationPin, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Drawer, Menu, Space, Typography } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shop } from '../../../../models/interfaces/shop'
import { ShopContext } from '../../../../contexts/ShopContext'

const { Text } = Typography

const NavBar = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const location = useLocation().pathname.replace(/\/+$/, '')
    const {shop} = useContext(ShopContext);

    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768)
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    const prefixUrl = `/shop/${shop.shopName}`
    const menuItems = [
        { key: prefixUrl + '', label: <Link to={prefixUrl}>Home</Link> },
        { key: prefixUrl + '/prices', label: <Link to={prefixUrl + '/prices'}>Repair Prices</Link> },
        { key: prefixUrl + '/blog', label: <Link to={prefixUrl + '/blog'}>Blog</Link> },
        { key: prefixUrl + '/accessories', label: <Link to={prefixUrl + '/accessories'}>Accessories</Link> },
        { key: prefixUrl + '/contact', label: <Link to={prefixUrl + '/contact'}>Contact us</Link> },
        {
            key: 'phone',
            label: (
                <a href={`tel:${shop.phone}`}>
                    <FontAwesomeIcon icon={faPhone} />
                    <Text strong>
                        {shop.phone}
                    </Text>
                </a>
            ),
        },
    ]

    const NavMenu = () => (
        <Menu
            mode={isMobile ? 'inline' : 'horizontal'}
            selectedKeys={[location]}
            items={menuItems}
            onClick={() => setDrawerVisible(false)}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
            }}
            className='custom-nav-menu'
        />
    )

    return (
        <div className='navBar'>
            <div className='mini-nav'>
                <img src='/templates/hatfield/welwyn-hatfield-logo.png' alt='Welwyn Hatfield Logo' />
                {isMobile && (
                    <Button
                        type='text'
                        size='large'
                        shape='circle'
                        icon={<FontAwesomeIcon icon={faLocationPin} size='xl' />}
                    />
                )}
            </div>

            <div className='menu'>
                {isMobile ? (
                    <>
                        <Button
                            type='text'
                            size='large'
                            icon={<FontAwesomeIcon icon={faPhone} size='xl' />}
                            style={{ marginRight: 12 }}
                        />
                        <Button
                            type='text'
                            size='large'
                            icon={<FontAwesomeIcon icon={faBars} size='xl' />}
                            onClick={() => setDrawerVisible(true)}
                        />
                    </>
                ) : (
                    <NavMenu />
                )}
            </div>

            <Drawer
                title='Menu'
                placement='right'
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={280}
                styles={{
                    header: { background: '#001529', borderBottom: 'none' },
                    body: { background: '#001529', padding: 0 },
                }}
            >
                <NavMenu />
            </Drawer>
        </div>
    )
}

export default NavBar
