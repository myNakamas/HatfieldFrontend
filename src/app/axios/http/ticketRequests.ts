import { Page, PageRequest } from '../../models/interfaces/generalModels';
import backendClient from '../backendClient';
import { ChatMessage, CreateTicket, Ticket } from '../../models/interfaces/ticket';
import { TicketFilter } from '../../models/interfaces/filters';

export const fetchAllTickets = ({ page,filter }: { page: PageRequest,filter:TicketFilter }): Promise<Page<Ticket>> => {
    const ticketFilter = {...filter, ticketStatuses:filter.ticketStatuses?.join(',')}
    return backendClient.get('ticket/all', { params: { ...page,...ticketFilter } })
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

export const fetchChat = ({ userId }: { userId: string }): Promise<ChatMessage[]> => {
    return backendClient.get('chat/all', { params: { userId } })
}
