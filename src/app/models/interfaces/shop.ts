import { Entity, ItemPropertyView } from './generalModels'
import { User } from './user'
import { LogType } from '../enums/logEnums'

export interface ThemeColors {
    primaryColor: string
    secondaryColor: string
}

export interface ShopSettingsModel extends Entity, ThemeColors {
    emailNotificationsEnabled: boolean
    gmail: string
    gmailPassword: string
    smsNotificationsEnabled: boolean
    smsApiKey: string
    printEnabled: boolean
    printerIp: string
    printerModel: string
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
    purchasePrice?: number
    sellPrice?: number
    shopId: number
    requiredItem?: RequiredItem
    categoryView: Category
    columns: CategoryProperties
}

export interface CreateInventoryItem {
    name?: string
    count: number
    shopId: number
    purchasePrice?: number
    sellPrice?: number
    model: ItemPropertyView
    brand: Brand
    categoryId: number
    properties: CategoryProperties
}

export interface RequiredItem {
    requiredAmount: number
    isNeeded: boolean
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
    type: LogType
    user: User
    timestamp: Date
    ticketId?: number
    itemId?: number
    invoiceId?: number
    shopId?: number
}
export interface Brand extends ItemPropertyView {
    models: ItemPropertyView[]
}

export interface TransferItem {
    itemId: number
    shopId: number
    count: number
}
