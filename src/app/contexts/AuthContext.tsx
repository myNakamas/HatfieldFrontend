import React, { ReactNode, useEffect, useState } from "react";
import { User } from "../models/interfaces/user";
import { getLoggedUser } from "../axios/userRequests";
import { useLocation, useNavigate } from "react-router-dom";

export interface AuthContextData {
    loggedUser?: User
    setLoggedUser: React.Dispatch<React.SetStateAction<User | undefined>>
    saveLoggedUser: (user: User, token: string) => void
    isLoggedIn: () => boolean
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const navigate = useNavigate()
    const location = useLocation()

    const logout = () => {
        setLoggedUser(undefined)
        localStorage.clear()
        navigate('/login', { state: { from: location } })
    }
    const isLoggedIn = () => {
        if (!loggedUser && localStorage.getItem('token')) getLoggedUser().then((user) => setLoggedUser(user))
        return !!loggedUser || !!localStorage.getItem('token')
    }

    const saveLoggedUser = (user: User, token: string) => {
        setLoggedUser(user)
        localStorage.setItem('token', token)
    }

    document.addEventListener('session_expired', () => logout())
    useEffect(() => {
        if (!isLoggedIn()) logout()
    }, [loggedUser])

    return (
        <AuthContext.Provider value={{ loggedUser, setLoggedUser, saveLoggedUser, isLoggedIn, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
