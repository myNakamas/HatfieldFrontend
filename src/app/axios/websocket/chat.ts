import { stompClient } from '../websocketClient'
import { ChatMessage, CreateChatMessage } from '../../models/interfaces/ticket'

export const sendMessage = async (message: CreateChatMessage) => {
    stompClient.publish({ destination: '/app/chat', body: JSON.stringify(message) })
}
export const sendMessageSeen = async (message: ChatMessage) => {
    if (message?.id) stompClient.publish({ destination: '/app/chat/seen', body: JSON.stringify(message.id) })
}
export const registerToChat = (
    id: string | undefined,
    callBack: (message: ChatMessage) => void,
    sentMessage: (message: ChatMessage) => void
) => {
    stompClient.subscribe('/user/' + id + '/chat', (response) => {
        const message = JSON.parse(response.body)
        if (message) callBack(message)
    })
    stompClient.subscribe('/user/' + id + '/sent', (response) => {
        const message = JSON.parse(response.body)
        if (message) sentMessage(message)
    })
    stompClient.subscribe('/user/' + id + '/seen', (response) => {
        console.log('Message seen')
        const message = JSON.parse(response.body)
        if (message) sentMessage(message)
    })
}
