import backendClient from '../backendClient'
import { InventoryFilter, ItemPropertyView, Page, PageRequest } from '../../models/interfaces/generalModels'
import { Category, CreateInventoryItem, InventoryItem, Shop } from '../../models/interfaces/shop'

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

export const getShopData = (): Promise<Shop> => {
    return backendClient.get('shop/myShop')
}
export const getShopById = (shopId: number): Promise<Shop> => {
    return backendClient.get('shop/admin/byId', { params: { shopId } })
}
export const updateShop = (value: Shop): Promise<Shop> => {
    return backendClient.put('shop/admin/update', value)
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

export const getAllCategories = (): Promise<Category[]> => {
    return backendClient.get('category/all')
}

export const updateCategory = (category: Category): Promise<void> => {
    return backendClient.put('category/admin/update', category)
}

export const addCategory = (category: Category): Promise<void> => {
    return backendClient.post('category/admin/create', category)
}
