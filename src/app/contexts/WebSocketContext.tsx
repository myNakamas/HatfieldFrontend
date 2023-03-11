import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { connectToWebsocket, stompClient } from '../axios/websocketClient'
import { registerToChat } from '../axios/websocket/chat'
import { UserChats } from '../models/interfaces/ticket'

export interface WebSocketContextData {
    messages: UserChats
    setMessages: React.Dispatch<React.SetStateAction<UserChats>>
}

export const WebSocketContext: React.Context<WebSocketContextData> = React.createContext({} as WebSocketContextData)

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser, isLoggedIn } = useContext(AuthContext)
    const [messages, setMessages] = useState<UserChats>({})
    useEffect(() => {
        if (isLoggedIn()) {
            connectToWebsocket(() => {
                registerToChat(loggedUser?.userId, (message) => {
                    setMessages((prev) => {
                        prev[message.sender].received = [...prev[message.sender].received, message]
                        return { ...prev }
                    })
                })
            })
        } else stompClient.deactivate().then()
    }, [loggedUser])

    return <WebSocketContext.Provider value={{ messages, setMessages }}>{children}</WebSocketContext.Provider>
}
