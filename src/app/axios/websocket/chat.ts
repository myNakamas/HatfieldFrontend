import { stompClient } from '../websocketClient'
import { ChatMessage, CreateChatMessage } from '../../models/interfaces/ticket'
import { UploadFile } from 'antd'
import backendClient from '../backendClient'

export const sendMessage = async (message: CreateChatMessage) => {
    return stompClient.publish({ destination: '/app/chat', body: JSON.stringify(message) })
}
export const sendMessageSeen = async (message: ChatMessage) => {
    if (message?.id) stompClient.publish({ destination: '/app/chat/seen', body: JSON.stringify(message.id) })
}
export const registerToChat = (id: string | undefined, callBack: (message: ChatMessage) => void) => {
    stompClient.subscribe('/user/' + id + '/chat', (response) => {
        const message = JSON.parse(response.body)
        callBack(message)
    })
}
export const uploadPicture = (fileList: UploadFile<any>[], ticketId?: number, publicMessage?: boolean) => {
    const data = new FormData()
    const item = fileList.at(0)?.originFileObj
    if (item) data.append('image', item)
    return backendClient.post('/chat/image', data, { params: { ticketId, publicMessage } })
}
