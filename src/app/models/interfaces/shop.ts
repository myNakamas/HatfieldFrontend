import { Entity, ItemPropertyView } from './generalModels'
import { User } from './user'
import { LogType } from '../enums/logEnums'

export interface ThemeColors {
    primaryColor: string
    secondaryColor: string
}

export interface ShopTemplatesSettings {
    aboutPage: string
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
    templates: ShopTemplatesSettings
}

export interface InventoryItem extends Entity {
    name?: string
    imei?: string
    model: string
    brand: string
    count: number
    requiredAmount: number
    purchasePrice?: number
    sellPrice?: number
    shopId: number
    missingCount: number
    requiredItem?: RequiredItem
    categoryView: Category
    columns: CategoryProperties
}

export interface ShoppingList {
    items: InventoryItem[]
    totalPrice: number
}

export interface CreateInventoryItem {
    name?: string
    imei?: string
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
    defectiveAmount: number
    isNeeded: boolean
}

export interface CategoryProperties {
    [key: string]: string
}
export interface CategoryColumn {
    name: string
    showOnDocument?: boolean
    showNameOnDocument?: boolean
}
export interface Category extends Entity {
    name: string
    itemType: string
    columns: CategoryColumn[]
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
