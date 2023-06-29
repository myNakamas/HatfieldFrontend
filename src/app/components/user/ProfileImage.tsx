import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import React from 'react'
import { Avatar, Image } from 'antd'
import SkeletonAvatar from 'antd/es/skeleton/Avatar'
import { NoDataComponent } from '../table/NoDataComponent'

export const ProfileImage = ({
    profileImg,
    className,
    isLoading,
}: {
    profileImg?: Blob
    className?: string
    isLoading?: boolean
}) => {
    if (isLoading) return <SkeletonAvatar className={className} />
    return profileImg && profileImg.size > 0 ? (
        <Avatar size={'large'} className={className} alt='Profile image' src={URL.createObjectURL(profileImg)} />
    ) : (
        <Avatar size={'large'} icon={<FontAwesomeIcon icon={faUser} />} />
    )
}

export const ProfileImageLarge = ({
    profileImg,
    className,
    isLoading,
}: {
    profileImg?: Blob
    className?: string
    isLoading?: boolean
}) => {
    if (isLoading) return <SkeletonAvatar className={className} />
    return profileImg && profileImg.size > 0 ? (
        <Image width={200} className={className} alt='Profile image' src={URL.createObjectURL(profileImg)} />
    ) : (
        <NoDataComponent items={'image'} />
    )
}
