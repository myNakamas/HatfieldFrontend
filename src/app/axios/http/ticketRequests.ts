import { AppError, Page, PageRequest } from '../../models/interfaces/generalModels'
import backendClient from '../backendClient'
import { ChatMessage, CreateTicket, CreateUsedItem, Ticket } from '../../models/interfaces/ticket'
import { TicketFilter } from '../../models/interfaces/filters'
import { CreateTicketInvoice } from '../../models/interfaces/invoice'

function prepareTicketFilter(filter?: TicketFilter) {
    return { ...filter, ticketStatuses: filter?.ticketStatuses?.join(',') }
}

export const fetchAllTickets = ({
    page,
    filter,
}: {
    page: PageRequest
    filter: TicketFilter
}): Promise<Page<Ticket>> => {
    const ticketFilter = prepareTicketFilter(filter)
    return backendClient.get('ticket/all', { params: { ...page, ...ticketFilter } })
}
export const fetchClientTickets = ({
    page,
    filter,
}: {
    page: PageRequest
    filter: TicketFilter
}): Promise<Page<Ticket>> => {
    const ticketFilter = prepareTicketFilter(filter)
    return backendClient.get('ticket/client/all', { params: { ...page, ...ticketFilter } })
}
export const fetchAllActiveTickets = ({ filter }: { filter?: TicketFilter }): Promise<Ticket[]> => {
    const ticketFilter = prepareTicketFilter(filter)
    return backendClient.get('ticket/active', { params: { ...ticketFilter } })
}
export const fetchClientActiveTickets = ({ filter }: { filter?: TicketFilter }): Promise<Ticket[]> => {
    const ticketFilter = prepareTicketFilter(filter)
    return backendClient.get('ticket/client/active', { params: { ...ticketFilter } })
}
export const fetchTicketById = (id?: number): Promise<Ticket> => {
    return backendClient.get('ticket/byId', { params: { id } })
}

export const putFreezeTicket = (params: { id: number }): Promise<void> => {
    return backendClient.put('ticket/client/freeze', {}, { params })
}
export const putCancelTicket = (params: { id: number }): Promise<void> => {
    return backendClient.put('ticket/client/cancel', {}, { params })
}
export const createTicket = ({ ticket }: { ticket: CreateTicket }): Promise<Ticket> => {
    const deadline = new Date(ticket.deadline).toISOString()
    const body = { ...ticket, deadline }
    return backendClient.post('ticket/worker/create', body)
}
export const updateTicket = ({ id, ticket }: { id?: number; ticket: CreateTicket }): Promise<Ticket> => {
    const deadline = ticket.deadline ? new Date(ticket.deadline).toISOString() : undefined
    const body = { ...ticket, deadline }
    return backendClient.put('ticket/worker/update/' + id, body)
}

export const putCompleteTicket = (params: { id: number; success: boolean }): Promise<AppError> => {
    return backendClient.put('ticket/worker/complete', {}, { params })
}

export const putStartTicket = (params: { id: number }): Promise<number> => {
    return backendClient.put('ticket/worker/start', {}, { params })
}

export const putCollectTicket = ({ id, invoice }: { id: number; invoice: CreateTicketInvoice }): Promise<Blob> => {
    return backendClient.put('ticket/worker/collected', invoice, { params: { id }, responseType: 'blob' })
}
export const putCreateDepositInvoice = ({
    id,
    invoice,
}: {
    id: number
    invoice: CreateTicketInvoice
}): Promise<Blob> => {
    return backendClient.put('ticket/worker/deposit', invoice, { params: { id }, responseType: 'blob' })
}

export const getChat = (params: { ticketId?: number; page: number; pageSize: number }): Promise<Page<ChatMessage>> => {
    if (!params.ticketId) return new Promise(() => [])
    return backendClient.get('chat/all', { params })
}
export const getClientChat = (params: { ticketId?: number; page: PageRequest }): Promise<Page<ChatMessage>> => {
    if (!params.ticketId) return new Promise(() => [])
    return backendClient.get('chat/client/all', { params })
}

export const createUsedItems = (usedItem: CreateUsedItem) => {
    return backendClient.post('ticket/worker/part/use', usedItem)
}
