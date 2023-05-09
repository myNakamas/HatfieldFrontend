import backendClient from '../backendClient'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import { Filter, InvoiceFilter } from '../../models/interfaces/filters'
import { CreateInvoice, Invoice, InvoicesReport } from '../../models/interfaces/invoice'

export const createInvoice = (value: CreateInvoice): Promise<number> => {
    return backendClient.post('invoice/create', value)
}
export const getAllInvoices = ({ page, filter }: { page: PageRequest; filter: Filter }): Promise<Page<Invoice>> => {
    return backendClient.get('invoice/all', { params: { ...page, ...filter } })
}

export const getInvoicesReport = ({ filter }: { filter: InvoiceFilter }): Promise<InvoicesReport> => {
    return backendClient.get('invoice/report', { params: { ...filter } })
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
export const invalidateInvoice = (invoiceId: number): Promise<Blob> => {
    return backendClient.delete('invoice/invalidate', { params: { id: invoiceId } })
}
export const getInvoiceByTicketId = (ticketId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byTicketId', { params: { ticketId } })
}
