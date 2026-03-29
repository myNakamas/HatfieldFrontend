import { ConfigProvider, theme } from 'antd'
import locale from 'antd/locale/en_GB'
import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { getShopSettings } from '../axios/http/settingsRequests'
import { getShopPublicData } from '../axios/http/shopRequests'
import { CustomSuspense } from '../components/CustomSuspense'
import { ShopSettingsModel } from '../models/interfaces/shop'
import { User } from '../models/interfaces/user'
import { AuthContext } from './AuthContext'

export interface ThemeContextData {
    colors?: ShopSettingsModel
}

export const ThemeContext: React.Context<ThemeContextData> = React.createContext({} as ThemeContextData)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [prefersDark, setPrefersDark] = useState(true)
    const [colors, setColors] = useState<ShopSettingsModel>()
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth)
    window.addEventListener('resize', () => setScreenWidth(window.innerWidth))

    const { loggedUser } = useContext(AuthContext)
    const { defaultAlgorithm, darkAlgorithm } = theme
    const isLoading = useGetThemeColors(loggedUser, setColors)

    useEffect(() => {
        const mediaResult = window.matchMedia('(prefers-color-scheme: dark)')
        setPrefersDark(mediaResult.matches)
    }, [])
    return (
        <CustomSuspense isReady={!isLoading}>
            <ConfigProvider
                componentSize={screenWidth < 768 ? 'small' : screenWidth < 1200 ? 'middle' : 'large'}
                locale={locale}
                theme={{
                    token: {
                        colorPrimary: colors?.primaryColor ?? 'cyan',
                        colorFill: colors?.secondaryColor ?? '#5258B1',
                        colorInfo: colors?.secondaryColor ?? '#5258B1',
                    },
                    algorithm: prefersDark ? darkAlgorithm : defaultAlgorithm,
                }}
            >
                <ThemeContext.Provider
                    value={{
                        colors: {
                            ...colors,
                            primaryColor: colors?.primaryColor ?? 'cyan',
                            secondaryColor: colors?.secondaryColor ?? '#5258B1',
                        } as ShopSettingsModel,
                    }}
                >
                    {children}
                </ThemeContext.Provider>
            </ConfigProvider>
        </CustomSuspense>
    )
}
function useGetThemeColors(
    loggedUser: User | undefined,
    setColors: React.Dispatch<React.SetStateAction<ShopSettingsModel | undefined>>
): boolean {
    const { isLoading: isLoadingTheme } = useQuery(['theme'], () => getShopSettings(), {
        retry: false,
        enabled: loggedUser != undefined,
        onSuccess: (response) => {
            if (response) {
                const root = document.documentElement
                root?.style.setProperty('--primaryColor', response.primaryColor)
                root?.style.setProperty('--secondaryColor', response.secondaryColor)
                setColors(response)
            }
        },
    })
    const shopName = location.pathname.includes('/shop/') ? location.pathname.split('/shop/')[1].split('/')[0] : undefined;
    const { isLoading: isLoadingPublic } = useQuery(['public-theme', shopName], () => getShopPublicData(shopName), {
        retry: false,
        enabled: shopName !== undefined && location.pathname.startsWith('/shop/'),
        onSuccess: (shop) => {
            if (shop != null && shop.shopSettingsView != null) {
                const root = document.documentElement
                root?.style.setProperty('--primaryColor', shop.shopSettingsView.primaryColor)
                root?.style.setProperty('--secondaryColor', shop.shopSettingsView.secondaryColor)
                setColors(shop.shopSettingsView)
            }
        },
    })
    return isLoadingTheme || isLoadingPublic
}
