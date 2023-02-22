import React, { ReactNode, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { useQuery } from 'react-query'
import { getShopSettings } from '../axios/settingsRequests'

import { createCssVars } from '../styles/cssFunctions'
import { ThemeColors } from '../models/interfaces/shop'
import { createGlobalStyle } from 'styled-components'

export interface ThemeContextData {
    primaryColor: string
    secondaryColor: string
}

export const ThemeContext: React.Context<ThemeContextData> = React.createContext({} as ThemeContextData)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser } = useContext(AuthContext)
    const { data } = useQuery(['shopSettings'], getShopSettings, { enabled: !!loggedUser })
    const colors: ThemeColors = data ?? { primaryColor: '#ccc', secondaryColor: '#cc0' }

    const GlobalStyle = createGlobalStyle`
      :root {
        ${createCssVars(colors)}
      }
    `
    return (
        <ThemeContext.Provider value={data ?? { primaryColor: '#ccc', secondaryColor: '#cc0' }}>
            <GlobalStyle />
            {children}
        </ThemeContext.Provider>
    )
}
