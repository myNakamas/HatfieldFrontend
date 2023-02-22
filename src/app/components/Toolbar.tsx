import { ProfileDropdown } from './user/ProfileDropdown'

export const Toolbar = () => {
    const title = 'Hatfield'
    return (
        <div className='toolbar'>
            <div>{title}</div>
            <ProfileDropdown />
        </div>
    )
}
