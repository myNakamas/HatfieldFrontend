import backendClient from './backendClient'
import { Page, PageRequest } from '../models/interfaces/generalModels'
import { InventoryItem } from '../models/interfaces/shop'

export const useGetShopItems = ({ page }: { page: PageRequest }): Promise<Page<InventoryItem>> => {
    return backendClient.get('inventoryItem/all', { params: page })
}
