import { ProfileDropdown } from '../user/ProfileDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import React from 'react'
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell'

export const Toolbar = ({ setShowNav }: { setShowNav: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const title = 'Hatfield'
    return (
        <div className='toolbar'>
            <div className='icon-s clickable' onClick={() => setShowNav((prev) => !prev)}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div>
                <h2>{title}</h2>
            </div>
            <div className='toolbar-right'>
                <div className='notificationBell'>
                    <FontAwesomeIcon size='lg' icon={faBell} />
                </div>
                <ProfileDropdown />
            </div>
        </div>
    )
}
