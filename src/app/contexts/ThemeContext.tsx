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
        })
    }

    return <>{children}</>
}
