import React, { ReactNode, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { getShopSettings } from '../axios/settingsRequests'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser } = useContext(AuthContext)

    if (loggedUser) {
        getShopSettings().then((colors) => {
            const root = document.documentElement
            root?.style.setProperty('--primaryColor', colors.primaryColor)
            root?.style.setProperty('--secondaryColor', colors.secondaryColor)
            root?.style.setProperty('--secondaryLightColor', colors.secondaryLightColor)
            root?.style.setProperty('--secondaryDarkColor', colors.secondaryDarkColor)
            root?.style.setProperty('--textColor', colors.textColor)
        })
    }

    return <>{children}</>
}
