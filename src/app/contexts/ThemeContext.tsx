import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { getShopSettings } from '../axios/http/settingsRequests'
import { ShopSettingsModel } from '../models/interfaces/shop'
import { ConfigProvider, theme } from 'antd'
import { CustomSuspense } from '../components/CustomSuspense'
import locale from 'antd/locale/en_GB'
import { useQuery } from 'react-query'

export interface ThemeContextData {
    colors?: ShopSettingsModel
}

export const ThemeContext: React.Context<ThemeContextData> = React.createContext({} as ThemeContextData)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [prefersDark, setPrefersDark] = useState(true)
    const [colors, setColors] = useState<ShopSettingsModel>()
    const { loggedUser } = useContext(AuthContext)
    const { defaultAlgorithm, darkAlgorithm } = theme
    const { isLoading } = useQuery(['theme'], () => getShopSettings(), {
        retry: false,
        enabled: loggedUser!=undefined,
        onSuccess: (response) => {
            if (response) {
                const root = document.documentElement
                root?.style.setProperty('--primaryColor', response.primaryColor)
                root?.style.setProperty('--secondaryColor', response.secondaryColor)
                setColors(response)
            }
        },
    })

    useEffect(() => {
        const mediaResult = window.matchMedia('(prefers-color-scheme: dark)')
        setPrefersDark(mediaResult.matches)
    }, [])
    return (
        <CustomSuspense isReady={!isLoading}>
            <ConfigProvider
                locale={locale}
                theme={{
                    token: {
                        colorPrimary: colors?.primaryColor ?? 'cyan',
                        colorFill: colors?.secondaryColor ?? '#5258B1',
                    },
                    algorithm: prefersDark ? darkAlgorithm : defaultAlgorithm,
                }}
            >
                <ThemeContext.Provider value={{ colors:{...colors,
                        primaryColor: colors?.primaryColor ?? 'cyan',
                        secondaryColor: colors?.secondaryColor ?? '#5258B1',
                    } as ShopSettingsModel }}>{children}</ThemeContext.Provider>
            </ConfigProvider>
        </CustomSuspense>
    )
}
