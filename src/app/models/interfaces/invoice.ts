import { Entity } from './generalModels'
import { User } from './user'
import { InvoiceType, PaymentMethod, WarrantyPeriod } from '../enums/invoiceEnums'

export interface Invoice extends Entity {
    type: InvoiceType
    deviceModel: string
    deviceBrand: string
    serialNumber: string
    timestamp: Date
    ticketId: number
    notes: string
    totalPrice: number
    createdBy: User
    client: User
    paymentMethod: PaymentMethod
    warrantyPeriod: WarrantyPeriod
    valid: boolean
}

export interface CreateTicketInvoice {
    ticketId: number
    notes?: string
    totalPrice: number
    clientId: string
    paymentMethod: PaymentMethod
    warrantyPeriod: WarrantyPeriod
}

export interface CreateInvoice {
    itemId?: number
    type: InvoiceType
    deviceModel: string
    deviceBrand: string
    serialNumber: string
    count: number
    notes?: string
    totalPrice: number
    clientId?: string
    paymentMethod: PaymentMethod
    warrantyPeriod: WarrantyPeriod
}

export interface InvoicesReport {
    totalCount: number
    totalAmount: number
    calendar: InvoiceDailyReport[]
}

export interface InvoiceDailyReport {
    date: string
    dailyIncome: number
    count: number
}
