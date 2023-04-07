import { SideNavigation } from './SideNavigation'
import { Toolbar } from './Toolbar'
import { ReactNode, useState } from 'react'

export const AppWrapper = ({ children }: { children: ReactNode }) => {
    const [showNav, setShowNav] = useState(false)

    return (
        <>
            <Toolbar setShowNav={setShowNav} />
            <div className='app-screen'>
                <SideNavigation showNavigation={showNav} setShowNav={setShowNav} />
                {children}
            </div>
        </>
    )
}
