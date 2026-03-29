import { Brand, PricingEvaluation } from '../../models/interfaces/shop'
import { Pricing } from '../../pages/pricing/types'
import backendClient from '../backendClient'

const BASE_URL = '/price'

export const pricingApi = {
    // Public evaluation endpoint
    evaluate: (
        deviceType: string,
        brandName: string | undefined,
        model: string,
        issue: string
    ): Promise<PricingEvaluation> => {
        return backendClient.get(`${BASE_URL}/evaluate`, {
            params: {
                deviceType,
                brand: brandName,
                model,
                issue,
            },
        })
    },
    getFiltered: (deviceType?: string, brand?: string, model?: string): Promise<Pricing[]> => {
      return backendClient.get(`${BASE_URL}/worker/pricings/filter`, {
        params: {
          deviceType,
          brand,
          model,
        },
      });
    },

    create: (pricing: Omit<Pricing, 'id'>): Promise<Pricing> => {
        return backendClient.post(`${BASE_URL}/worker/pricings`, pricing)
    },

    update: (pricing: Pricing): Promise<Pricing> => {
        return backendClient.put(`${BASE_URL}/worker/pricings/${pricing.id}`, pricing)
    },

    delete: (id: number): Promise<void> => {
        return backendClient.delete(`${BASE_URL}/worker/pricings/${id}`)
    },
    // CSV Export
    downloadCsv: () => {
        return backendClient.get(`${BASE_URL}/worker/pricings/csv`, {
            responseType: 'blob',
        })
    },

    // CSV Import
    uploadCsv: (file: File): Promise<void> => {
        const formData = new FormData()
        formData.append('file', file)
        return backendClient.post(`${BASE_URL}/worker/pricings/csv`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },
}
