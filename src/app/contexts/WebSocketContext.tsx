import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { connectToWebsocket, stompClient } from '../axios/websocketClient'
import { registerToChat } from '../axios/websocket/chat'
import { ChatMessage, CreateChatMessage, MissedMessages, UserChats } from '../models/interfaces/ticket'
import { sortChatByDate } from '../utils/helperFunctions'
import { toast } from 'react-toastify'
import { toastChatProps } from '../components/modals/ToastProps'
import { useLocation, useNavigate } from 'react-router-dom'
import { Typography } from 'antd'
import { useQuery } from 'react-query'
import { getNotificationCount } from '../axios/http/ticketRequests'

export interface WebSocketContextData {
    userChats: UserChats
    setUserChats: React.Dispatch<React.SetStateAction<UserChats>>
    addUnsentMessage: (message: CreateChatMessage) => void
    removeUnsentMessage: (message: ChatMessage) => void
    notificationCount: MissedMessages
    setNotificationCount: React.Dispatch<React.SetStateAction<MissedMessages>>
}

export const WebSocketContext: React.Context<WebSocketContextData> = React.createContext({} as WebSocketContextData)

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser } = useContext(AuthContext)
    const [userChats, setUserChats] = useState<UserChats>({})
    const [notificationCount, setNotificationCount] = useState<MissedMessages>({ totalCount: 0, countPerTicket: {} })
    useQuery(['messages', 'missed'], getNotificationCount, {
        enabled: !!loggedUser,
        onSuccess: setNotificationCount,
    })
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (loggedUser?.userId) {
            connectToWebsocket(() => {
                toast.info('Connection established', { position: 'bottom-center', toastId: 'wsConnected' })
                registerToChat(loggedUser?.userId, (message: ChatMessage) => {
                    addNotificationCount(message.ticketId).then()
                    toast.info(
                        <Typography onClick={() => navigate('/chats?id=' + message.ticketId)}>
                            Ticket#{message.ticketId}:<br />
                            {message.isImage ? ' A photo was sent' : '\n' + message.text}
                        </Typography>,
                        { ...toastChatProps }
                    )
                    addMessageToUserChats(message)
                })
            })
        } else stompClient.deactivate().then()
    }, [loggedUser])

    const addNotificationCount = async (ticketId: number) => {
        const params = new URLSearchParams(location.search)
        const id = params.get('id') ?? -1
        if (+id !== ticketId)
            setNotificationCount((prev) => {
                prev.countPerTicket[ticketId] = (prev.countPerTicket[ticketId] ?? 0) + 1
                prev.totalCount++
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
            if (messages.some(({ randomId }) => message.randomId === randomId)) return prev
            prev[message.ticketId] = [...messages, message].sort(sortChatByDate)
            return { ...prev }
        })
    }
    const replaceOrAddMessageUserChats = (message: ChatMessage) => {
        setUserChats((prev) => {
            const { ticketId, randomId } = message
            const existingIndex = prev[ticketId]?.findIndex((m) => m.randomId === randomId)
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
