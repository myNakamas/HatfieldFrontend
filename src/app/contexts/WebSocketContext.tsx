import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { connectToWebsocket, stompClient } from '../axios/websocketClient'
import { registerToChat } from '../axios/websocket/chat'
import { ChatMessage, UserChats } from '../models/interfaces/ticket'

export interface WebSocketContextData {
    userChats: UserChats
    setUserChats: React.Dispatch<React.SetStateAction<UserChats>>
    unsentMessages: ChatMessage[]
    setUnsentMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

export const WebSocketContext: React.Context<WebSocketContextData> = React.createContext({} as WebSocketContextData)

export const WebSocketContextProvider = ({ children }: { children: ReactNode }) => {
    const { loggedUser, isLoggedIn } = useContext(AuthContext)
    const [userChats, setUserChats] = useState<UserChats>({})
    const [unsentMessages, setUnsentMessages] = useState<ChatMessage[]>([])
    useEffect(() => {
        if (isLoggedIn()) {
            connectToWebsocket(() => {
                registerToChat(
                    loggedUser?.userId,
                    (message) => {
                        setUserChats((prev) => {
                            // on received message, add it to the messages
                            prev[message.sender] = [...prev[message.sender], message]
                            return { ...prev }
                        })
                    },
                    (message) => {
                        setUnsentMessages((unsent) => {
                            // remove the message from the unsent messages
                            const filtered = unsent.filter((msg) => msg.randomId !== message.randomId)
                            return [...filtered]
                        })
                        setUserChats((prev) => {
                            //if message is missing, add it to the userChats
                            //todo: Refactor chats
                            if (
                                message.receiver &&
                                !prev[message.receiver].some((value) => value.randomId === message.randomId)
                            )
                                prev[message.receiver] = [...(prev[message.receiver] ?? []), message]
                            return { ...prev }
                        })
                    },
                    (message) => {
                        setUserChats((prev) => {
                            //on message marked as seen, find it by id and mark it as seen
                            const index = prev[message.receiver].findIndex((value) => value.id === message.id)
                            prev[message.receiver][index] = message
                            return { ...prev }
                        })
                    }
                )
            })
        } else stompClient.deactivate().then()
    }, [loggedUser])

    return (
        <WebSocketContext.Provider value={{ userChats, setUserChats, unsentMessages, setUnsentMessages }}>
            {children}
        </WebSocketContext.Provider>
    )
}
