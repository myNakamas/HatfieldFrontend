import backendClient from '../backendClient'

export const postPrintItemLabel = (itemId: number | undefined): Promise<Blob> => {
    if (!itemId) return new Promise(() => null)
    return backendClient.post('document/print/tag/price', {}, { params: { itemId }, responseType: 'blob' })
}
