import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import React from 'react'

export const ProfileImage = ({ profileImg, className }: { profileImg?: Blob; className?: string }) => {
    return profileImg && profileImg.size > 0 ? (
        <img className={`profileImage ${className}`} alt='Profile image' src={URL.createObjectURL(profileImg)} />
    ) : (
        <FontAwesomeIcon size='lg' icon={faUser} />
    )
}
