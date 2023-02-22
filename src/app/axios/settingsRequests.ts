import backendClient from './backendClient'
import { ShopSettingsModel } from '../models/interfaces/shop'

export const getShopSettings = (): Promise<ShopSettingsModel> => {
    return backendClient.get('shop/settings')
}
