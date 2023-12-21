import { ProfileDropdown } from '../user/ProfileDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { Button, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

export const Toolbar = ({ setShowNav }: { setShowNav: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const navigate = useNavigate()
    const { loggedUser } = useContext(AuthContext)
    return (
        <div className='toolbar'>
            <Button
                aria-label='Open Drawer'
                shape='circle'
                icon={<FontAwesomeIcon icon={faBars} />}
                size={'large'}
                className={'button'}
                onClick={() => setShowNav((prev) => !prev)}
            />

            <Button
                type={'text'}
                style={{ width: 'fit-content', height: 'fit-content' }}
                onClick={() => navigate('/home')}
            >
                <Typography className={'title'}>{loggedUser?.shopName}</Typography>
            </Button>

            <div className='toolbar-right'>
                <ProfileDropdown />
            </div>
        </div>
    )
}
