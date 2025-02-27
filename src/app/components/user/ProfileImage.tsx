import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Image } from 'antd'
import SkeletonAvatar from 'antd/es/skeleton/Avatar'
import { memo } from 'react'
import { NoDataComponent } from '../table/NoDataComponent'

const ProfileImage = ({
    profileImg,
    className,
    isLoading,
}: {
    profileImg?: string
    className?: string
    isLoading?: boolean
}) => {
    if (isLoading) return <SkeletonAvatar className={className} />
    return profileImg && profileImg.length > 0 ? (
        <Avatar size={'large'} className={className} alt='Profile image' src={profileImg} />
    ) : (
        <Avatar size={'large'} icon={<FontAwesomeIcon icon={faUser} />} />
    )
}

export const ImageLarge = ({
    profileImg,
    className,
    isLoading,
}: {
    profileImg?: string
    className?: string
    isLoading?: boolean
}) => {
    if (isLoading) return <SkeletonAvatar className={className} />
    return profileImg && profileImg.length > 0 ? (
        <Image width={200} className={className} alt='Profile image' src={profileImg} />
    ) : (
        <NoDataComponent items={'image'} />
    )
}

export default memo(ProfileImage)
