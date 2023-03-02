import React, { ReactNode, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { getShopSettings } from "../axios/settingsRequests";
import { ShopSettingsModel } from "../models/interfaces/shop";
import { InfinitySpin } from "react-loader-spinner";

export const ThemeContext: React.Context<ShopSettingsModel> = React.createContext({} as ShopSettingsModel)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [colors, setColors] = useState<ShopSettingsModel>()
    const { loggedUser } = useContext(AuthContext)

    useEffect(() => {
        if (loggedUser) {
            getShopSettings().then((response) => {
                if(response) {
                    const root = document.documentElement;
                    root?.style.setProperty("--primaryColor", response.primaryColor);
                    root?.style.setProperty("--secondaryColor", response.secondaryColor);
                    root?.style.setProperty("--secondaryLightColor", response.secondaryLightColor);
                    root?.style.setProperty("--secondaryDarkColor", response.secondaryDarkColor);
                    root?.style.setProperty("--textColor", response.textColor);
                    setColors(response);
                }
            })
        }
    }, [loggedUser])
    if(!colors) return <div className='fullPageLoading'><InfinitySpin  color='cyan'/></div>;
    return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>
}
