import { SideNavigation } from './SideNavigation'
import { Toolbar } from './Toolbar'
import { ReactNode, useState } from 'react'

export const AppWrapper = ({ children }: { children: ReactNode }) => {
    const [showNav, setShowNav] = useState(false)

    return (
        <>
            <Toolbar setShowNav={setShowNav} />
            <div className='flex'>
                <SideNavigation showNavigation={showNav} setShowNav={setShowNav} />
                <div className={`${showNav ? 'fakeSideNav' : 'invisible'}`} />
                <div className={`flex-grow `}>{children}</div>
            </div>
        </>
    )
}
