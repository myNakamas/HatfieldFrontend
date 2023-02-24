import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuHeader, MenuItem } from '@szhsin/react-menu'
import { capitalizeFirst } from '../../utils/helperFunctions'

export const ProfileDropdown = () => {
    const { loggedUser, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    return (
        <Menu
            transition
            menuButton={
                <MenuHeader className='menu '>
                    <div className='username'>{capitalizeFirst(loggedUser?.username)}</div>
                    <div className='role'>{loggedUser?.role}</div>
                </MenuHeader>
            }
        >
            <MenuItem onClick={() => navigate(`/profile/${loggedUser?.id}`)}>Settings</MenuItem>
            <MenuItem
                onClick={() => {
                    logout()
                    navigate(`/login`)
                }}
            >
                Logout
            </MenuItem>
        </Menu>
    )
}
