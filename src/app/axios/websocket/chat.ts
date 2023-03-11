import { stompClient } from '../websocketClient'
import { ChatMessage, CreateChatMessage } from '../../models/interfaces/ticket'

export const sendMessage = async (message: CreateChatMessage) => {
    stompClient.publish({ destination: '/app/chat', body: JSON.stringify(message) })
}
export const registerToChat = (id: string | undefined, callBack: (message: ChatMessage) => void) => {
    stompClient.subscribe('/user/' + id + '/chat', (response) => {
        const message = JSON.parse(response.body)
        if (message) callBack(message)
    })
}
