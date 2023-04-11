import backendClient from '../backendClient'
import { PageRequest } from '../../models/interfaces/generalModels'
import { Filter } from '../../models/interfaces/filters'
import { CreateTicketInvoice, Invoice } from '../../models/interfaces/invoice'

export const createInvoice = (value: CreateTicketInvoice) => {
    return backendClient.post('invoice/create', value)
}
export const getAllInvoices = ({}: { page: PageRequest; filter: Filter }): Promise<Invoice[]> => {
    return backendClient.get('invoice/all')
}
export const getInvoiceByClientId = (clientId: string): Promise<Invoice[]> => {
    return backendClient.get('invoice/allByClient', { params: { clientId } })
}
export const getInvoiceById = (invoiceId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byId', { params: { invoiceId } })
}
export const getInvoiceByTicketId = (ticketId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byTicketId', { params: { ticketId } })
}
