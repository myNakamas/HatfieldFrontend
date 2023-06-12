import { Entity } from './generalModels'
import { User } from './user'
import { InvoiceType, PaymentMethod, WarrantyPeriod } from '../enums/invoiceEnums'

export interface Invoice extends Entity {
    type: InvoiceType
    serialNumber: string
    deviceName: string
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
export interface CreateInvoice {
    type: InvoiceType
    notes?: string
    totalPrice: number
    clientId?: string
    paymentMethod: PaymentMethod
    warrantyPeriod: WarrantyPeriod
    deviceName: string
    deviceModel: string
    deviceBrand: string
}

export interface CreateTicketInvoice extends CreateInvoice {
    ticketId: number
}

export interface CreateItemInvoice extends CreateInvoice {
    itemId?: number
    serialNumber: string
    count: number
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
