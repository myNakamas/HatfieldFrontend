import backendClient from '../backendClient'

export const getImage = (imageUrl: string): Promise<Blob> => {
    return backendClient.get(imageUrl, { responseType: 'blob' })
}
