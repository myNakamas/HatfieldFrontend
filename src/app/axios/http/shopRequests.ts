import backendClient from '../backendClient'
import { ItemPropertyView, Page, PageRequest } from '../../models/interfaces/generalModels'
import { Filter, InventoryFilter } from '../../models/interfaces/filters'
import { Category, CreateInventoryItem, InventoryItem, Log, Shop } from '../../models/interfaces/shop'

export const getAllShops = (): Promise<Shop[]> => {
    return backendClient.get('shop/admin/all')
}

export const useGetShopItems = ({
    page,
    filter,
}: {
    page: PageRequest
    filter: InventoryFilter
}): Promise<Page<InventoryItem>> => {
    return backendClient.get('inventory/item/all', { params: { ...page, ...filter } })
}
export const getAllShopItems = (shopId?: number): Promise<InventoryItem[]> => {
    const filter: InventoryFilter = { shopId }
    return backendClient.get('inventory/item/short', { params: filter })
}
export const getShoppingList = ({ filter }: { filter: InventoryFilter }): Promise<InventoryItem[]> => {
    return backendClient.get('inventory/item/required', { params: filter })
}

export const setShoppingList = ({
    shopId,
    ids,
    isNeeded,
}: {
    shopId?: number
    ids: string[]
    isNeeded: boolean
}): Promise<InventoryItem[]> => {
    return backendClient.put('inventory/item/required', ids, { params: { shopId, isNeeded } })
}
export const setRequiredItemCount = ({ id, count }: { id: number; count?: number }): Promise<InventoryItem[]> => {
    if (!count) return Promise.reject()
    return backendClient.put('inventory/item/required/count', {}, { params: { id, count } })
}

export const getShopData = (): Promise<Shop> => {
    return backendClient.get('shop/myShop')
}
export const getShopById = (shopId: number): Promise<Shop> => {
    return backendClient.get('shop/admin/byId', { params: { shopId } })
}
export const updateShop = (value: Shop): Promise<Shop> => {
    return backendClient.put('shop/admin/update', value)
}
export const createShop = (value: Shop): Promise<Shop> => {
    return backendClient.post('shop/admin/create', value)
}

export const getAllModels = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('inventory/model/all')
}
export const getAllBrands = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('inventory/brand/all')
}
export const addNewItem = ({
    item: { model, brand, ...rest },
}: {
    item: CreateInventoryItem
}): Promise<InventoryItem> => {
    const body = { ...rest, modelId: model?.id, model: model?.value, brandId: brand?.id, brand: brand?.value }
    return backendClient.post('inventory/item/create', body)
}
export const putUpdateItem = ({ item }: { item: CreateInventoryItem }) => {
    return backendClient.post('inventory/item/update', item)
}
export const updateItemQuantity = ({ item }: { item: InventoryItem }) => {
    return backendClient.post('inventory/item/updateQuantity', item)
}

export const getAllCategories = (): Promise<Category[]> => {
    return backendClient.get('category/all')
}

export const updateCategory = (category: Category): Promise<Category> => {
    return backendClient.put('category/admin/update', category, { params: { id: category.id } })
}

export const addCategory = (category: Category): Promise<Category> => {
    return backendClient.post('category/admin/create', category)
}
export const getAllLogs = ({ filter, page }: { filter: Filter; page: PageRequest }): Promise<Page<Log>> => {
    return backendClient.get('logs/all', { params: { ...filter, ...page } })
}
