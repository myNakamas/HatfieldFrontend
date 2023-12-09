import backendClient from '../backendClient'
import { toast } from 'react-toastify'
import { toastPrintTemplate, toastProps } from '../../components/modals/ToastProps'
import { openPdfBlob } from '../../pages/invoices/Invoices'

export const postPrintItemLabel = (itemId: number | undefined): Promise<Blob> => {
    if (!itemId) return new Promise(() => null)
    return backendClient.post('document/print/tag/price', {}, { params: { itemId }, responseType: 'blob' })
}
export const getPrintItemLabel = (itemId: number | undefined): Promise<Blob> => {
    if (!itemId) return new Promise(() => null)
    return backendClient.get('document/print/tag/price', { params: { itemId }, responseType: 'blob' })
}
export const postPrintTicketLabel = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/tag/repair', {}, { params: { ticketId }, responseType: 'blob' })
}
export const getTicketImage = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.get('document/print/ticket', { params: { ticketId, print: false }, responseType: 'blob' })
}
export const getTicketLabelImage = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.get('document/print/tag/repair', { params: { ticketId, print: false }, responseType: 'blob' })
}
export const printUserLabel = (userId: string | undefined, print: boolean) => {
    const promise = print ? postPrintUser(userId) : getPrintUser(userId)
    toast.promise(promise, toastPrintTemplate, toastProps).then(openPdfBlob)
}
export const postPrintTicket = (ticketId: number | undefined): Promise<Blob> => {
    if (!ticketId) return new Promise(() => null)
    return backendClient.post('document/print/ticket', {}, { params: { ticketId }, responseType: 'blob' })
}

export const postPrintUser = (userId: string | undefined): Promise<Blob> => {
    if (!userId) return new Promise(() => null)
    return backendClient.post('document/print/tag/user', {}, { params: { userId }, responseType: 'blob' })
}
export const getPrintUser = (userId: string | undefined): Promise<Blob> => {
    if (!userId) return new Promise(() => null)
    return backendClient.get('document/print/tag/user', { params: { userId }, responseType: 'blob' })
}
export const postPrintExample = (): Promise<void> => {
    return backendClient.post('document/print/example')
}
