import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { connectToWebsocket, stompClient } from '../axios/websocketClient'
import { registerToChat } from '../axios/websocket/chat'
import { ChatMessage, CreateChatMessage, UserChats } from '../models/interfaces/ticket'
import { sortChatByDate } from '../utils/helperFunctions'

export interface WebSocketContextData {
    userChats: UserChats
    setUserChats: React.Dispatch<React.SetStateAction<UserChats>>
    addUnsentMessage: (message: CreateChatMessage) => void
    removeUnsentMessage: (message: ChatMessage) => void
    notificationCount: number
    setNotificationCount: React.Dispatch<React.SetStateAction<number>>
}

export const WebSocketContext: React.Context<WebSocketContextData> = React.createContext({} as WebSocketContextData)

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser } = useContext(AuthContext)
    const [userChats, setUserChats] = useState<UserChats>({})
    const [notificationCount, setNotificationCount] = useState(0)

    useEffect(() => {
        if (loggedUser?.userId) {
            connectToWebsocket(() => {
                registerToChat(loggedUser?.userId, addMessageToUserChats, replaceOrAddMessageUserChats)
            })
        } else stompClient.deactivate().then()
    }, [loggedUser])

    const addUnsentMessage = (message: CreateChatMessage) => {
        const newMessage = { ...message, status: 'NotSent' } as ChatMessage
        addMessageToUserChats(newMessage)
    }
    const removeUnsentMessage = (message: ChatMessage) => {
        replaceOrAddMessageUserChats(message)
    }
    const addMessageToUserChats = (message: ChatMessage) => {
        setUserChats((prev) => {
            const messages = prev[message.ticketId] ?? []
            if (prev[message.ticketId].some(({ randomId }) => message.randomId === randomId)) return prev
            prev[message.ticketId] = [...messages, message].sort(sortChatByDate)
            return { ...prev }
        })
    }
    const replaceOrAddMessageUserChats = (message: ChatMessage) => {
        setUserChats((prev) => {
            const { ticketId, randomId } = message
            const existingIndex = prev[ticketId].findIndex((m) => m.randomId === randomId)
            const messages = prev[ticketId] ?? []
            if (existingIndex >= 0) {
                messages[existingIndex] = message
                prev[ticketId] = messages
            } else {
                prev[ticketId] = [...messages, message].sort(sortChatByDate)
            }
            return { ...prev }
        })
    }

    return (
        <WebSocketContext.Provider
            value={{
                userChats,
                setUserChats,
                addUnsentMessage,
                removeUnsentMessage,
                notificationCount,
                setNotificationCount,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    )
}
