import { Entity, ItemPropertyView } from './generalModels'
import { User } from './user'

export interface ThemeColors {
    primaryColor: string
    secondaryColor: string
}

export interface ShopSettingsModel extends Entity, ThemeColors {
    gmail: string
    gmailPassword: string
    smsApiKey: string
    // logoURL:string;
    // backgroundImageURL:string;
}

export interface Shop extends Entity {
    shopName: string
    address: string
    phone: string
    email: string
    vatNumber: string
    regNumber: string
    shopSettingsView: ShopSettingsModel
}

export interface InventoryItem extends Entity {
    name?: string
    model: string
    brand: string
    count: number
    requiredAmount: number
    price?: number
    shopId: number
    requiredItem?: RequiredItem
    categoryView: Category
    columns: CategoryProperties
}

export interface CreateInventoryItem {
    name?: string
    count: number
    shopId: number
    price?: number
    model: ItemPropertyView
    brand: Brand
    categoryId: number
    properties: CategoryProperties
}

type RequiredItemReason = 'NEEDED_FOR_TICKET' | 'INVENTORY_EMPTY' | 'REQUESTED'
type RequiredItemStatus = 'NOT_NEEDED' | 'PENDING' | 'RECEIVED'

export interface RequiredItem {
    requiredAmount: number
    requiredReason?: RequiredItemReason
    status: RequiredItemStatus
}

export interface CategoryProperties {
    [key: string]: string
}

export interface Category extends Entity {
    name: string
    itemType: string
    columns: string[]
}
export interface ReturnItem {
    returnCount: number
    item: InventoryItem
}
export interface Log extends Entity {
    action: string
    user: User
    timestamp: Date
    ticketId: number
    itemId: number
    tag: string
}
export interface Brand extends ItemPropertyView {
    models: ItemPropertyView[]
}
