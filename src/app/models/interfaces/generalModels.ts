import { Shop } from './shop'

export interface Entity {
    id: number
}

export interface PageRequest {
    pageSize: number
    page: number
}

export interface Page<T> {
    page: number
    pageSize: number
    totalCount: number
    pageCount: number
    content: T[]
}

export interface ButtonProps {
    onAction: () => void
    content: string
    className?: string
}

export interface AppError {
    detail: string
    instance: string
    status: number
    title: string
    type: string
}

export interface ItemPropertyView extends Entity {
    value: string
}

export interface Filter {
    searchBy?: string
}

export interface UserFilter extends Filter {
    shop?: Shop
    roles?: ItemPropertyView[]
    active?: boolean
    banned?: boolean
    phone?: string
}

export interface InventoryFilter extends Filter {
    searchBy?: string
    modelId?: number
    brandId?: number
    shopId?: number
    categoryId?: number
    isNeeded?: boolean
}

export const toUserFilterView = (filter: UserFilter | undefined) => {
    return {
        shopId: filter?.shop?.id,
        roles: filter?.roles?.map(({ value }) => value).join(','),
        banned: filter?.banned,
        phone: filter?.phone,
        active: filter?.active,
    }
}
