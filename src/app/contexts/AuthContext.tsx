import React, { ReactNode, useState } from 'react'
import { User } from '../models/interfaces/user'
import { getLoggedUser } from '../axios/userRequests'

export interface AuthContextData {
    loggedUser?: User
    isLoggedIn: () => boolean
    saveLoggedUser: (user: User) => void
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const logout = () => {
        setLoggedUser(undefined)
        localStorage.removeItem('token')
    }
    window.addEventListener('session_expired', () => {
        logout()
    })
    const saveLoggedUser = (user: User) => {
        setLoggedUser(user)
    }
    const isLoggedIn = (): boolean => {
        if (!loggedUser && localStorage.getItem('token')) getLoggedUser().then((user) => setLoggedUser(user))
        return !!loggedUser || localStorage.getItem('token') != undefined
    }

    return (
        <AuthContext.Provider value={{ loggedUser, isLoggedIn, saveLoggedUser, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
