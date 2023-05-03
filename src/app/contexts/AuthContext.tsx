import React, { ReactNode, useEffect, useState } from 'react'
import { User } from '../models/interfaces/user'
import { getLoggedUser } from '../axios/http/userRequests'
import { useLocation, useNavigate } from 'react-router-dom'
import { stompClient } from '../axios/websocketClient'

export interface AuthContextData {
    loggedUser?: User
    token?: string
    setLoggedUser: React.Dispatch<React.SetStateAction<User | undefined>>
    login: (user: User, token: string, pageToRedirectTo?: string) => void
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
        stompClient.deactivate().then()
        localStorage.clear()
        setLoggedUser(undefined)
        setToken(undefined)
    }
    const isLoggedIn = () => {
        return !!localStorage.getItem('token')
    }

    const login = (user: User, token: string) => {
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
    useEffect(() => {
        if (!loggedUser) {
            navigate('/login', { state: { from: location } })
        }
    }, [loggedUser, navigate, location])

    document.addEventListener('session_expired', () => logout())

    return (
        <AuthContext.Provider value={{ loggedUser, setLoggedUser, login: login, isLoggedIn, logout, token }}>
            {children}
        </AuthContext.Provider>
    )
}
