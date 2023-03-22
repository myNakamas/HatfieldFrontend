import { ProfileDropdown } from '../user/ProfileDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars'
import React, { useContext } from 'react'
import { useQuery } from 'react-query'
import { getProfilePicture } from '../../axios/http/userRequests'
import { AuthContext } from '../../contexts/AuthContext'
import { ProfileImage } from '../user/ProfileImage'

export const Toolbar = ({ setShowNav }: { setShowNav: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { loggedUser } = useContext(AuthContext)
    const { data: profileImg } = useQuery(['profileImg', loggedUser?.userId], () =>
        getProfilePicture({ id: loggedUser?.userId ?? '' })
    )
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
                <div className='icon-s'>
                    <ProfileImage profileImg={profileImg} />
                </div>
                <ProfileDropdown />
            </div>
        </div>
    )
}
