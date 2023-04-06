import { Entity } from './generalModels'
import { User } from './user'
import { InvoiceType, PaymentMethod, WarrantyPeriod } from '../enums/invoiceEnums'

export interface Invoice extends Entity {
    type: InvoiceType
    deviceModel: string
    deviceBrand: string
    serialNumber: string
    timestamp: Date
    notes: string
    totalPrice: number
    createdBy: User
    client: User
    paymentMethod: PaymentMethod
    warrantyPeriod: WarrantyPeriod
}
