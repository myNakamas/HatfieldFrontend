import { Entity } from './generalModels'
import { TicketStatus } from '../enums/ticketEnums'
import { User } from './user'

export interface Ticket extends Entity {
    deviceModel: string
    deviceBrand: string
    deviceLocation: string
    customerRequest: string
    problemExplanation: string
    deviceCondition: string
    devicePassword: string
    serialNumberOrImei: string
    accessories: string
    timestamp: Date
    deadline: Date
    notes: string
    status: TicketStatus
    totalPrice: number
    deposit: number
    createdBy: User
    client: User
    priority: number
}

export interface CreateTicket {
    deviceModel: string
    deviceBrand: string
    deviceLocation: string
    customerRequest: string
    problemExplanation: string
    deviceCondition: string
    devicePassword: string
    serialNumberOrImei: string
    accessories: string
    deadline: Date | string
    notes: string
    status: TicketStatus
    totalPrice: number
    deposit: number
    clientId: string
    priority: number
}

export const createTicketFromTicket = (t: Ticket): CreateTicket => {
    const clientId = t.client?.userId
    const deadline = new Date(t.deadline)
    return { ...t, clientId, deadline }
}

/**
 * - sender: UUID of User that sends the message
 * - receiver: UUID of User that receives the message
 * - readByReceiver: The time of the message being read. Can be null (not read yet)
 */
export interface CreateChatMessage {
    text: string
    timestamp: Date
    sender: string
    receiver: string
    ticketId: number
    randomId: number
}

export interface ChatMessage extends Entity, CreateChatMessage {
    readByReceiver: Date
}

export interface Chat {
    chat: ChatMessage[]
    receiver?: User
    sender?: User
    ticket: Ticket
}

export interface UserChats {
    [key: string]: ChatMessage[]
}

export interface UsedItemModel {
    itemId: number
    ticketId: number
    count: number
}
