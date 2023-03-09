import { Page, PageRequest } from '../../models/interfaces/generalModels'
import backendClient from '../backendClient'
import { CreateTicket, Ticket } from '../../models/interfaces/ticket'

export const fetchAllTickets = ({ page }: { page: PageRequest }): Promise<Page<Ticket>> => {
    return backendClient.get('ticket/all', { params: page })
}

export const createTicket = ({ body }: { body: CreateTicket }): Promise<number> => {
    return backendClient.post('ticket', body)
}
