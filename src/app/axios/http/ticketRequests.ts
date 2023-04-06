import { Page, PageRequest } from '../../models/interfaces/generalModels'
import backendClient from '../backendClient'
import { ChatMessage, CreateTicket, CreateUsedItem, Ticket } from '../../models/interfaces/ticket'
import { TicketFilter } from '../../models/interfaces/filters'

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
export const fetchAllActiveTickets = (): Promise<Ticket[]> => {
    return backendClient.get('ticket/active')
}

export const createTicket = ({ ticket }: { ticket: CreateTicket }): Promise<number> => {
    const deadline = new Date(ticket.deadline).toISOString()
    const body = { ...ticket, deadline }
    return backendClient.post('ticket', body)
}
export const updateTicket = ({ id, ticket }: { id: number; ticket: CreateTicket }): Promise<number> => {
    const deadline = new Date(ticket.deadline).toISOString()
    const body = { ...ticket, deadline }
    return backendClient.put('ticket/update/' + id, body)
}

export const postCompleteTicket = (params: { id: number; location: string }): Promise<number> => {
    return backendClient.put('ticket/complete', {}, { params })
}
export const postStartTicket = (params: { id: number }): Promise<number> => {
    return backendClient.put('ticket/start', {}, { params })
}
//todo: modal
export const postCollectTicket = (params: { id: number }): Promise<number> => {
    return backendClient.put('ticket/collected', {}, { params })
}

export const fetchChat = ({ userId }: { userId: string }): Promise<ChatMessage[]> => {
    return backendClient.get('chat/all', { params: { userId } })
}

export const createUsedItems = (usedItem: CreateUsedItem) => {
    return backendClient.post('ticket/part/use', usedItem)
}
