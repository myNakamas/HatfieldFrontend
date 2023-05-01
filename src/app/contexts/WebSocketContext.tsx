import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { connectToWebsocket, stompClient } from '../axios/websocketClient'
import { registerToChat } from '../axios/websocket/chat'
import { ChatMessage, CreateChatMessage, UserChats } from '../models/interfaces/ticket'
import { sortChatByDate } from '../utils/helperFunctions'
import { toast } from 'react-toastify'
import { toastChatProps } from '../components/modals/ToastProps'
import { useQuery } from 'react-query'
import { getAllUsers } from '../axios/http/userRequests'
import { useLocation } from 'react-router-dom'

export interface WebSocketContextData {
    userChats: UserChats
    setUserChats: React.Dispatch<React.SetStateAction<UserChats>>
    addUnsentMessage: (message: CreateChatMessage) => void
    removeUnsentMessage: (message: ChatMessage) => void
    notificationCount: NotificationCount
    setNotificationCount: React.Dispatch<React.SetStateAction<NotificationCount>>
}

export const WebSocketContext: React.Context<WebSocketContextData> = React.createContext({} as WebSocketContextData)

interface NotificationCount {
    [key: number]: number
}

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser } = useContext(AuthContext)
    const { data: users } = useQuery(['users'], () => getAllUsers({}))
    const [userChats, setUserChats] = useState<UserChats>({})
    const [notificationCount, setNotificationCount] = useState<NotificationCount>({})
    const location = useLocation()

    useEffect(() => {
        if (loggedUser?.userId) {
            connectToWebsocket(() => {
                toast.info('Connection established', { position: 'bottom-center' })
                registerToChat(
                    loggedUser?.userId,
                    (message: ChatMessage) => {
                        addNotificationCount(message.ticketId).then()
                        toast.info(
                            `Ticket#${message.ticketId}: ${
                                users?.find(({ userId }) => userId === message.sender)?.username
                            }:${message.isImage ? ' sent a photo' : '\n' + message.text}`,
                            toastChatProps
                        )
                        addMessageToUserChats(message)
                    },
                    replaceOrAddMessageUserChats
                )
            })
        } else stompClient.deactivate().then()
    }, [loggedUser])

    useEffect(() => {
        if (location.pathname.startsWith('/chats')) {
            const params = new URLSearchParams(location.search)
            const ticketId = params.get('id')
            if (ticketId) resetNotificationCount(+ticketId)
        }
    }, [location])

    const addNotificationCount = async (ticketId: number) => {
        const params = new URLSearchParams(location.search)
        const id = params.get('id') ?? -1
        if (+id !== ticketId)
            setNotificationCount((prev) => {
                prev[ticketId] = (prev[ticketId] ?? 0) + 1
                return prev
            })
    }

    const resetNotificationCount = (ticketId: number) => {
        setNotificationCount((prev) => {
            prev[ticketId] = 0
            return prev
        })
    }

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
