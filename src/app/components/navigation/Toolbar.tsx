import { ProfileDropdown } from '../user/ProfileDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import React from 'react'

export const Toolbar = ({ setShowNav }: { setShowNav: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const title = 'Hatfield'
    return (
        <div className='toolbar'>
            <div className='icon-s clickable' onClick={() => setShowNav((prev) => !prev)}>
                <FontAwesomeIcon icon={faBars} />
            </div>
            <div>{title}</div>
            <ProfileDropdown />
        </div>
    )
}
