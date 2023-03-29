import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { getShopSettings } from '../axios/http/settingsRequests'
import { ShopSettingsModel } from '../models/interfaces/shop'
import { ConfigProvider, theme } from 'antd'

export interface ThemeContextData {
    colors?: ShopSettingsModel
}

export const ThemeContext: React.Context<ThemeContextData> = React.createContext({} as ThemeContextData)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [prefersDark, setPrefersDark] = useState(true)
    const [colors, setColors] = useState<ShopSettingsModel>()
    const { loggedUser } = useContext(AuthContext)
    const { defaultAlgorithm, darkAlgorithm } = theme

    useEffect(() => {
        const mediaResult = window.matchMedia('(prefers-color-scheme: dark)')
        setPrefersDark(mediaResult.matches)
        if (loggedUser) {
            getShopSettings().then((response) => {
                if (response) {
                    const root = document.documentElement
                    root?.style.setProperty('--primaryColor', response.primaryColor)
                    root?.style.setProperty('--secondaryColor', response.secondaryColor)
                    setColors(response)
                }
            })
        }
    }, [loggedUser])
    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: colors?.primaryColor ?? 'cyan',
                    colorFillAlter: colors?.secondaryColor ?? '#5258B1',
                },
                algorithm: prefersDark ? darkAlgorithm : defaultAlgorithm,
            }}
        >
            <ThemeContext.Provider value={{ colors }}>{children}</ThemeContext.Provider>
        </ConfigProvider>
    )
}
