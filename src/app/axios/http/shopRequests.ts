import backendClient from '../backendClient'
import { ItemPropertyView, Page, PageRequest } from '../../models/interfaces/generalModels'
import { Filter, InventoryFilter } from '../../models/interfaces/filters'
import {
    Brand,
    Category,
    CreateInventoryItem,
    InventoryItem,
    Log,
    Shop,
    ShoppingList,
    TransferItem,
} from '../../models/interfaces/shop'

export const getAllShops = (): Promise<Shop[]> => {
    return backendClient.get('shop/admin/all')
}

export const useGetShopItems = ({
    page,
    filter,
}: {
    page: PageRequest
    filter?: InventoryFilter
}): Promise<Page<InventoryItem>> => {
    return backendClient.get('inventory/item/all', { params: { ...page, ...filter } })
}
export const getAllShopItems = (shopId?: number): Promise<InventoryItem[]> => {
    const filter: InventoryFilter = { shopId }
    return backendClient.get('inventory/item/short', { params: filter })
}
export const getShoppingList = ({ filter }: { filter: InventoryFilter }): Promise<ShoppingList> => {
    return backendClient.get('inventory/item/required', { params: filter })
}

export const updateRequiredItemCount = ({
    id,
    count,
    isNeeded,
}: {
    id: number
    count?: number
    isNeeded?: boolean
}): Promise<InventoryItem[]> => {
    if (!count) return Promise.reject()
    return backendClient.patch('inventory/item/required', {}, { params: { id, count, isNeeded } })
}
export const changeNeed = ({ id, isNeeded }: { id: number; isNeeded?: boolean }): Promise<InventoryItem[]> => {
    return backendClient.patch('inventory/item/changeNeed', {}, { params: { id, need: isNeeded } })
}
export const changeMultipleNeed = ({
    ids,
    isNeeded,
}: {
    ids: string[]
    isNeeded?: boolean
}): Promise<InventoryItem[]> => {
    return backendClient.put('inventory/item/changeNeed', ids, { params: { need: isNeeded } })
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
export const getAllBrands = (): Promise<Brand[]> => {
    return backendClient.get('inventory/brand/all')
}
export const patchRenameModel = (body: { id: number; value: string }) => {
    return backendClient.patch('inventory/model/edit', body)
}
export const getAllDeviceLocations = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('inventory/location/all')
}
export const getWorkerShops = (): Promise<ItemPropertyView[]> => {
    return backendClient.get('shop/worker/all')
}
export const sendToShop = ({ item }: { item: TransferItem }) => {
    return backendClient.post('inventory/item/sendToShop', [], { params: item })
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
export const fetchItemById = (params: { id?: number }): Promise<InventoryItem> => {
    return backendClient.get('inventory/item', { params })
}
export const updateItemQuantity = ({ item }: { item: InventoryItem }) => {
    const { id, count } = item
    return backendClient.post('inventory/item/updateQuantity', { id, count })
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

export const postMarkItemAsDamaged = (params: { itemId: number }) => {
    return backendClient.patch('inventory/item/mark/damaged', {}, { params })
}
export const postMarkItemAsDefective = (params: { itemId: number }) => {
    return backendClient.patch('inventory/item/mark/defective', {}, { params })
}

export const addItemCount = (params: { itemId: number; count?: number }) => {
    return backendClient.patch('inventory/item/add', {}, { params })
}
export const exchangeDefectiveItem = (params: { itemId: number; count?: number }) => {
    return backendClient.patch('inventory/item/mark/defective/replace', {}, { params })
}
export const deleteDefectiveItem = (params: { itemId: number; count?: number }): Promise<void> => {
    return backendClient.delete('inventory/item/mark/defective', { params })
}
