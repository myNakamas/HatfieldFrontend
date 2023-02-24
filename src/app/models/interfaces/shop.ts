import { Entity } from './generalModels'

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
    name: string

    shopSettings: ShopSettingsModel
}

export interface InventoryItem extends Entity {
    model: string
    brand: string
    count: number
    shopId: number
    type: string
}
