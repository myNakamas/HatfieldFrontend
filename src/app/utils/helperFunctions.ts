import { RcFile } from 'antd/es/upload'
import { ChatMessage } from '../models/interfaces/ticket'

export const capitalizeFirst = (str: string | undefined) => {
    return str?.substring(0, 1).toUpperCase().concat(str?.substring(1).toLowerCase())
}
export const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error)
    })
export const sortChatByDate = (a: ChatMessage, b: ChatMessage) => +new Date(b.timestamp) - +new Date(a.timestamp)
export const getCurrentTime = () => {
    return new Date().toISOString()
}
