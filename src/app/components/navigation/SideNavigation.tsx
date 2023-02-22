import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs'
import { faDashboard } from '@fortawesome/free-solid-svg-icons/faDashboard'
import './SideNav.scss'

export const SideNavigation = () => {
    return (
        <div className='sidenav'>
            <NavButton to={'/welcome'} icon={faHouse} label='Home' />
            <NavButton to={'/dashboard'} icon={faDashboard} label='Dashboard' />
            <NavButton to={'/users'} icon={faUsers} label='Clients' />
            <NavButton to={'/chats'} icon={faCommentDots} label='Chats' />
            <NavButton to={'/tickets'} icon={faTicket} label='Tickets' />
            <NavButton to={'/settings'} icon={faCogs} label='Settings' />
        </div>
    )
}

const NavButton = ({ to, icon, label }: { to: string; icon: IconDefinition; label: string }) => {
    return (
        <NavLink to={to} className='nav-button'>
            <FontAwesomeIcon size='lg' icon={icon} />
            <h3>{label}</h3>
        </NavLink>
    )
}
