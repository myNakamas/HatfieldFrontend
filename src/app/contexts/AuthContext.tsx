import React, { ReactNode, useEffect, useState } from "react";
import { User } from "../models/interfaces/user";
import { getLoggedUser } from "../axios/userRequests";
import { useLocation, useNavigate } from "react-router-dom";

export interface AuthContextData {
    loggedUser?: User
    saveLoggedUser: (user: User, token: string) => void
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const navigate = useNavigate()
    const location = useLocation()
    const logout = () => {
        setLoggedUser(undefined)
        localStorage.removeItem('token')
    }
    const saveLoggedUser = (user: User, token: string) => {
        setLoggedUser(user)
        localStorage.setItem('token', token)
    }
    document.addEventListener('session_expired', () => {
        logout()
        navigate("/login",{state:{from:location}})
    })
    useEffect(() => {
        if (!loggedUser && localStorage.getItem('token')) getLoggedUser().then((user) => setLoggedUser(user))
    }, [loggedUser])

    return <AuthContext.Provider value={{ loggedUser, saveLoggedUser, logout }}>{children}</AuthContext.Provider>
}
