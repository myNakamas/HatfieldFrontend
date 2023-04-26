import backendClient from '../backendClient'

export const postPrintItemLabel = (itemId: number | undefined): Promise<Blob> => {
    if (!itemId) return new Promise(() => null)
    return backendClient.post('document/print/tag/price', {}, { params: { itemId }, responseType: 'blob' })
}

export const postPrintTicketLabel = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/tag/repair', {}, { params: { ticketId }, responseType: 'blob' })
}

export const postPrintTicket = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/ticket', {}, { params: { ticketId }, responseType: 'blob' })
}
