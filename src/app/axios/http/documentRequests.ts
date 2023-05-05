import backendClient from '../backendClient'
import { toast } from 'react-toastify'
import { toastPrintTemplate, toastProps } from '../../components/modals/ToastProps'

export const postPrintItemLabel = (itemId: number | undefined): Promise<Blob> => {
    if (!itemId) return new Promise(() => null)
    return backendClient.post('document/print/tag/price', {}, { params: { itemId }, responseType: 'blob' })
}

export const postPrintTicketLabel = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/tag/repair', {}, { params: { ticketId }, responseType: 'blob' })
}
export const printUserLabel = (userId: string | undefined) => {
    toast.promise(postPrintUser(userId), toastPrintTemplate, toastProps).then((blob) => {
        const fileUrl = URL.createObjectURL(blob)
        window.open(fileUrl)
    })
}
export const postPrintTicket = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/ticket', {}, { params: { ticketId }, responseType: 'blob' })
}

export const postPrintUser = (userId: string | undefined): Promise<Blob> => {
    if (!userId) return new Promise(() => null)
    return backendClient.post('document/print/tag/user', {}, { params: { userId }, responseType: 'blob' })
}
