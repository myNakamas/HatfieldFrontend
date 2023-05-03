import { Page, PageRequest } from '../../models/interfaces/generalModels'
import backendClient from '../backendClient'
import { ChatMessage, CreateTicket, CreateUsedItem, Ticket } from '../../models/interfaces/ticket'
import { TicketFilter } from '../../models/interfaces/filters'
import { CreateTicketInvoice } from '../../models/interfaces/invoice'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export const fetchAllTickets = ({
    page,
    filter,
}: {
    page: PageRequest
    filter: TicketFilter
}): Promise<Page<Ticket>> => {
    const ticketFilter = { ...filter, ticketStatuses: filter.ticketStatuses?.join(',') }
    return backendClient.get('ticket/all', { params: { ...page, ...ticketFilter } })
}
export const fetchAllActiveTickets = ({ filter }: { filter?: TicketFilter }): Promise<Ticket[]> => {
    return backendClient.get('ticket/active', { params: { ...filter } })
}
export const fetchTicketById = (id: number): Promise<Ticket> => {
    return backendClient.get('ticket/byId', { params: { id } })
}

export const createTicket = ({ ticket }: { ticket: CreateTicket }): Promise<number> => {
    const deadline = new Date(ticket.deadline).toISOString()
    const body = { ...ticket, deadline }
    return backendClient.post('ticket', body)
}
export const updateTicket = ({ id, ticket }: { id: number; ticket: CreateTicket }): Promise<number> => {
    const deadline = ticket.deadline ? new Date(ticket.deadline).toISOString() : undefined
    const body = { ...ticket, deadline }
    return backendClient.put('ticket/update/' + id, body)
}

export const putCompleteTicket = (params: { id: number; location: string }): Promise<number> => {
    return backendClient.put('ticket/complete', {}, { params })
}

export const putStartTicket = (params: { id: number }): Promise<number> => {
    return backendClient.put('ticket/start', {}, { params })
}

export const putCollectTicket = ({ id, invoice }: { id: number; invoice: CreateTicketInvoice }): Promise<number> => {
    return backendClient.put('ticket/collected', invoice, { params: { id } })
}

export const useGetChat = ({ ticketId }: { ticketId?: number }): Promise<ChatMessage[]> => {
    if (!ticketId) return new Promise(() => [])
    const { loggedUser } = useContext(AuthContext)
    const url = loggedUser?.role === 'CLIENT' ? 'chat/client/all' : 'chat/all'
    return backendClient.get(url, { params: { ticketId } })
}

export const createUsedItems = (usedItem: CreateUsedItem) => {
    return backendClient.post('ticket/part/use', usedItem)
}
