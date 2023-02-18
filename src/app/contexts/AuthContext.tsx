import React, { ReactNode, useState } from 'react'
import { User } from '../models/interfaces/user'

export interface AuthContextData {
    loggedUser?: User
    saveLoggedUser: (user: User) => void;
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const logout = () => {
        setLoggedUser(undefined)
    }
    const saveLoggedUser = (user: User) => {
        setLoggedUser(user)
    }
    return <AuthContext.Provider value={{ loggedUser, saveLoggedUser, logout }}>{children}</AuthContext.Provider>
}
