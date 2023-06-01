import { ProfileDropdown } from '../user/ProfileDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import React, { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export const Toolbar = ({ setShowNav }: { setShowNav: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { loggedUser } = useContext(AuthContext)
    return (
        <div className='toolbar'>
            <div className='icon-s clickable' onClick={() => setShowNav((prev) => !prev)}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div>
                <h2>{loggedUser?.shopName}</h2>
            </div>
            <div className='toolbar-right'>
                <ProfileDropdown />
            </div>
        </div>
    )
}
