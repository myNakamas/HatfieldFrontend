import backendClient from '../backendClient'
import { ShopSettingsModel } from '../../models/interfaces/shop'

export const getShopSettings = (): Promise<ShopSettingsModel> => {
    return backendClient.get('shop/settings')
}
export const deleteCategory = (categoryId: number) => {
    return backendClient.delete('category/admin/delete', { params: { id: categoryId } })
}
