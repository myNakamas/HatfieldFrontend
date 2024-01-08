import backendClient from '../backendClient'
import { Page, PageRequest } from '../../models/interfaces/generalModels'
import { Filter, InvoiceFilter } from '../../models/interfaces/filters'
import { CreateItemInvoice, Invoice, InvoicesReport, SalesReport, TicketsReport } from '../../models/interfaces/invoice'

export const createInvoice = (value: CreateItemInvoice): Promise<number> => {
    const timestamp = new Date().toISOString()
    const body = { ...value, timestamp }
    return backendClient.post('invoice/create', body)
}
export const getAllInvoices = ({ page, filter }: { page: PageRequest; filter: Filter }): Promise<Page<Invoice>> => {
    return backendClient.get('invoice/all', { params: { ...page, ...filter } })
}

export const getInvoicesReport = ({ filter }: { filter: InvoiceFilter }): Promise<InvoicesReport> => {
    return backendClient.get('invoice/report', { params: { ...filter } })
}
export const getSalesReport = ({ filter }: { filter: InvoiceFilter }): Promise<SalesReport> => {
    return backendClient.get('invoice/report/sell', { params: { ...filter } })
}
export const getTicketsReport = ({ filter }: { filter: InvoiceFilter }): Promise<TicketsReport> => {
    return backendClient.get('ticket/report', { params: { ...filter } })
}
export const getInvoiceByClientId = (clientId: string): Promise<Invoice[]> => {
    return backendClient.get('invoice/allByClient', { params: { clientId } })
}
export const getInvoiceById = (invoiceId?: number): Promise<Invoice> => {
    return backendClient.get('invoice/byId', { params: { invoiceId } })
}
export const getInvoicePdf = (invoiceId: number): Promise<Blob> => {
    return backendClient.post('document/print/invoice', {}, { params: { invoiceId }, responseType: 'blob' })
}
export const getClientInvoicePdf = (invoiceId: number): Promise<Blob> => {
    return backendClient.get('document/client/print/invoice', { params: { invoiceId }, responseType: 'blob' })
}
export const invalidateInvoice = (invoiceId: number): Promise<Blob> => {
    return backendClient.delete('invoice/invalidate', { params: { id: invoiceId } })
}
export const getInvoiceByTicketId = (ticketId: number): Promise<Invoice> => {
    return backendClient.get('invoice/byTicketId', { params: { ticketId } })
}
