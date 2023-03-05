import { Entity, ItemPropertyView } from './generalModels';

export interface ThemeColors {
    primaryColor: string
    secondaryColor: string
    secondaryLightColor: string
    secondaryDarkColor: string
    textColor: string
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
    model: string
    brand: string
    count: number
    shopId: number
    type: string
}
export interface CreateInventoryItem {
    count: number
    shopId: number
    type: string
    model: ItemPropertyView,
    brand: ItemPropertyView
}
