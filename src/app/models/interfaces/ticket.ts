import { Entity } from './generalModels'
import { TicketStatus } from '../enums/ticketEnums'
import { User } from './user'

export interface Ticket extends Entity {
    deviceModel: string
    deviceBrand: string
    customerRequest: string
    problemExplanation: string
    deviceCondition: string
    devicePassword: string
    serialNumberOrImei: string
    accessories: string
    timestamp: Date
    deadline: Date
    notes: string
    status: string
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
    deadline: Date
    notes: string
    status: TicketStatus
    totalPrice: number
    deposit: number
    clientId: string
    priority: number
}
