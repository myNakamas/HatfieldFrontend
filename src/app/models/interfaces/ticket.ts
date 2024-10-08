import { Entity } from './generalModels'
import { TicketStatus } from '../enums/ticketEnums'
import { User } from './user'
import { InventoryItem } from './shop'
import { Invoice } from './invoice'
import moment, { Duration } from 'moment/moment'

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
    withClient?: boolean
    client: User
    usedParts: UsedItemView[]
    invoice?: Invoice
}

export interface CreateTicket {
    id?: number
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
    deadlineDuration?: Duration
    timestamp: Date | string
    notes: string
    status: TicketStatus
    totalPrice: number
    deposit: number
    withClient?: boolean
    client?: Partial<User>
    clientId?: string
}

export const createTicketFromTicket = (t: Ticket): CreateTicket => {
    const deadline = moment(t.deadline).toDate()
    return { ...t, deadline }
}

/**
 * - sender: UUID of User that sends the message
 * - receiver: UUID of User that receives the message
 * - readByReceiver: The time of the message being read. Can be null (not read yet)
 */
export interface CreateChatMessage {
    text: string
    timestamp: string
    sender: string
    receiver: string
    ticketId: number
    randomId: number
    publicMessage: boolean
}

type ChatMessageStatus = 'NotSent' | 'Sent'

export interface ChatMessage extends Entity, CreateChatMessage {
    readByReceiver: Date
    status?: ChatMessageStatus
    isImage?: boolean
}
export interface MissedMessages {
    countPerTicket: NotificationCount
    totalCount: number
}
export interface NotificationCount {
    [key: number]: number
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

export interface CreateUsedItem {
    itemId: number
    ticketId: number
    count: number
}

export interface UsedItemView {
    ticketId: number
    item: InventoryItem
    usedCount: number
    timestamp: Date
}
