import React, { ReactNode, useState } from 'react'
import { User } from '../models/interfaces/user'

export interface AuthContextData {
    loggedUser?: User
    setLoggedUser: React.Dispatch<React.SetStateAction<User | undefined>>;
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const logout = () => {
        setLoggedUser(undefined)
    }
    return <AuthContext.Provider value={{ loggedUser, setLoggedUser, logout }}>{children}</AuthContext.Provider>
}
