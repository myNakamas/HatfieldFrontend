import { SideNavigation } from './SideNavigation'
import { Toolbar } from './Toolbar'
import { ReactNode, useState } from 'react'

export const AppWrapper = ({ children }: { children: ReactNode }) => {
    const [smallScreen, setIfSmartScreen] = useState<boolean>(window.innerWidth < 768)
    const [showNav, setShowNav] = useState(!smallScreen)
    window.addEventListener('resize', () => setIfSmartScreen(window.innerWidth < 768))

    return (
        <>
            <Toolbar setShowNav={setShowNav} />
            <div className='flex'>
                <SideNavigation showNavigation={showNav} setShowNav={setShowNav} isSmallScreen={smallScreen} />
                <div className='flex-grow mainScreen'>{children}</div>
            </div>
        </>
    )
}
