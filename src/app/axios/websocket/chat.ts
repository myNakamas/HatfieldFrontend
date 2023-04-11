import { stompClient } from '../websocketClient'
import { ChatMessage, CreateChatMessage } from '../../models/interfaces/ticket'

export const sendMessage = async (message: CreateChatMessage) => {
    return stompClient.publish({ destination: '/app/chat', body: JSON.stringify(message) })
}
export const sendMessageSeen = async (message: ChatMessage) => {
    if (message?.id) stompClient.publish({ destination: '/app/chat/seen', body: JSON.stringify(message.id) })
}
export const registerToChat = (
    id: string | undefined,
    callBack: (message: ChatMessage) => void,
    markMessageSeen: (message: ChatMessage) => void
) => {
    stompClient.subscribe('/user/' + id + '/chat', (response) => {
        const message = JSON.parse(response.body)
        callBack(message)
    })
    stompClient.subscribe('/user/' + id + '/seen', (response) => {
        const message = JSON.parse(response.body)
        markMessageSeen(message)
    })
}
