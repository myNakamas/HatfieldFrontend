import React, { ReactNode, useEffect, useState } from 'react'
import { User } from '../models/interfaces/user'
import { getLoggedUser } from '../axios/http/userRequests'
import { useLocation, useNavigate } from 'react-router-dom'

export interface AuthContextData {
    loggedUser?: User
    token?: string
    setLoggedUser: React.Dispatch<React.SetStateAction<User | undefined>>
    saveLoggedUser: (user: User, token: string) => void
    isLoggedIn: () => boolean
    logout: () => void
}

export const AuthContext: React.Context<AuthContextData> = React.createContext({} as AuthContextData)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [loggedUser, setLoggedUser] = useState<User | undefined>()
    const [token, setToken] = useState<string | undefined>()
    const navigate = useNavigate()
    const location = useLocation()

    const logout = () => {
        setLoggedUser(undefined)
        localStorage.clear()
        setToken(undefined)
        navigate('/login', { state: { from: location } })
    }
    const isLoggedIn = () => {
        return !!localStorage.getItem('token')
    }

    const saveLoggedUser = (user: User, token: string) => {
        setLoggedUser(user)
        setToken(token)
        localStorage.setItem('token', token)
    }

    useEffect(() => {
        const tokenFromStorage = localStorage.getItem('token')
        if ((!loggedUser || !token) && tokenFromStorage) {
            setToken(tokenFromStorage)
            getLoggedUser().then((user) => setLoggedUser(user))
        }
    }, [])

    document.addEventListener('session_expired', () => logout())

    return (
        <AuthContext.Provider value={{ loggedUser, setLoggedUser, saveLoggedUser, isLoggedIn, logout, token }}>
            {children}
        </AuthContext.Provider>
    )
}
