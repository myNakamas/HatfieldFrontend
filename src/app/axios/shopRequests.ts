import backendClient from "./backendClient";
import { Page, PageRequest } from "../models/interfaces/generalModels";
import { InventoryItem, ItemPropertyView, Shop } from "../models/interfaces/shop";

export const useGetShopItems = ({ page }: { page: PageRequest }): Promise<Page<InventoryItem>> => {
    return backendClient.get('inventory/item/all', { params: page })
}

export const getShopData = (): Promise<Shop> => {
    return backendClient.get('shop/id')
}

export const getAllModels = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('inventory/brand/all')
}
export const getAllBrands = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('inventory/model/all')
}
export const addNewItem = ({ item }: { item: InventoryItem }) => {
    return backendClient.post('inventory/item/create', item)
}
