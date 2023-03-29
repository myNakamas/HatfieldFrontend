import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import React from 'react'

export const ProfileImage = ({ profileImg }: { profileImg?: Blob }) => {
    return profileImg ? (
        <img alt='Profile image' src={URL.createObjectURL(profileImg)} />
    ) : (
        <FontAwesomeIcon size='lg' icon={faUser} />
    )
}
