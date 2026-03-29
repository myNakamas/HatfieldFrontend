// usePricings.ts
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { pricingApi } from '../../../axios/http/pricingRequests'

export const usePricings = () => {
    const queryClient = useQueryClient()

    const createMutation = useMutation(
        pricingApi.create, // ← mutationFn directly (v3 style)
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['pricings'])
                toast.success('Pricing created successfully!')
            },
            onError: () => {
                toast.error('Failed to create pricing')
            },
        }
    )

    const updateMutation = useMutation(pricingApi.update, {
        onSuccess: () => {
            queryClient.invalidateQueries(['pricings'])
            toast.success('Pricing updated successfully!')
        },
        onError: () => {
            toast.error('Failed to update pricing')
        },
    })

    const deleteMutation = useMutation(pricingApi.delete, {
        onSuccess: () => {
            queryClient.invalidateQueries(['pricings'])
            toast.success('Pricing deleted successfully!')
        },
        onError: () => {
            toast.error('Failed to delete pricing')
        },
    })

    return {
        createPricing: createMutation.mutate,
        updatePricing: updateMutation.mutate,
        deletePricing: deleteMutation.mutate,

        isCreating: createMutation.isLoading,
        isUpdating: updateMutation.isLoading,
        isDeleting: deleteMutation.isLoading,
    }
}
