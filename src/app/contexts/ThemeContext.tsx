import React, { ReactNode, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getShopSettings } from "../axios/http/settingsRequests";
import { ShopSettingsModel } from "../models/interfaces/shop";

export interface ThemeContextData {
    colors?: ShopSettingsModel
}

export const ThemeContext: React.Context<ThemeContextData> = React.createContext({} as ThemeContextData)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [colors, setColors] = useState<ShopSettingsModel>()
    const { loggedUser } = useContext(AuthContext)

    useEffect(() => {
        if (loggedUser) {
            getShopSettings().then((response) => {
                if (response) {
                    const root = document.documentElement
                    root?.style.setProperty('--primaryColor', response.primaryColor)
                    root?.style.setProperty('--secondaryColor', response.secondaryColor)
                    root?.style.setProperty('--secondaryLightColor', response.secondaryLightColor)
                    root?.style.setProperty('--secondaryDarkColor', response.secondaryDarkColor)
                    root?.style.setProperty('--textColor', response.textColor)
                    setColors(response)
                }
            })
        }
    }, [loggedUser])
    return <ThemeContext.Provider value={{ colors }}>{children}</ThemeContext.Provider>
}
