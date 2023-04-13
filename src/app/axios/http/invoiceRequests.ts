import backendClient from '../backendClient'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import { Filter } from '../../models/interfaces/filters'
import { CreateTicketInvoice, Invoice } from '../../models/interfaces/invoice'

export const createInvoice = (value: CreateTicketInvoice) => {
    return backendClient.post('invoice/create', value)
}
export const getAllInvoices = ({ page, filter }: { page: PageRequest; filter: Filter }): Promise<Page<Invoice>> => {
    return backendClient.get('invoice/all', { params: { ...page, ...filter } })
}
export const getInvoiceByClientId = (clientId: string): Promise<Invoice[]> => {
    return backendClient.get('invoice/allByClient', { params: { clientId } })
}
export const getInvoiceById = (invoiceId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byId', { params: { invoiceId } })
}
export const getInvoicePdf = (invoiceId: number): Promise<Blob> => {
    return backendClient.post('document/print/invoice', {}, { params: { invoiceId }, responseType: 'blob' })
}
export const getInvoiceByTicketId = (ticketId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byTicketId', { params: { ticketId } })
}
