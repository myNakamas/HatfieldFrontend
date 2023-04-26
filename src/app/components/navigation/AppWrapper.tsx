import { SideNavigation } from './SideNavigation'
import { Toolbar } from './Toolbar'
import { ReactNode, useState } from 'react'
import { AppFooter } from './AppFooter'
import { useLocation } from 'react-router-dom'

export const AppWrapper = ({ children }: { children: ReactNode }) => {
    const location = useLocation()
    const [showNav, setShowNav] = useState(false)

    return (
        <div className={'app-screen'}>
            <Toolbar setShowNav={setShowNav} />
            <div className='app-content'>
                <SideNavigation showNavigation={showNav} setShowNav={setShowNav} />
                {children}
            </div>
            {location.pathname !== '/chats' && <AppFooter />}
        </div>
    )
}
