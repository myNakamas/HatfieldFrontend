import { ItemPropertyView } from './generalModels'
import { TicketStatus } from '../enums/ticketEnums'
import { InvoiceType } from '../enums/invoiceEnums'
import { LogType } from '../enums/logEnums'

export interface Filter {
    searchBy?: string
    from?: string
    to?: string
}

export interface UserFilter extends Filter {
    shopId?: number
    roles?: ItemPropertyView[]
    active?: boolean
    banned?: boolean
    phone?: string
}

export interface InventoryFilter extends Filter {
    modelId?: number
    brandId?: number
    shopId?: number
    categoryId?: number
    isNeeded?: boolean
    onlyNonEmpty?: boolean
    inShoppingList?: boolean
}

export interface TicketFilter extends Filter {
    modelId?: number
    brandId?: number
    deviceLocation?: number
    shopId?: number
    clientId?: string
    createdById?: string
    createdBefore?: string
    createdAfter?: string
    deadlineBefore?: string
    deadlineAfter?: string
    ticketStatuses?: TicketStatus[]
    hideCompleted?: boolean
}

export interface InvoiceFilter extends Filter {
    model?: string
    brand?: string
    deviceLocation?: number
    shopId?: number
    ticketId?: number
    clientId?: string
    createdById?: string
    createdBefore?: string
    createdAfter?: string
    type?: InvoiceType
    valid?: boolean
}
export interface LogsFilter extends Filter {
    shopId?: number
    ticketId?: number
    type?: LogType
}

export const toUserFilterView = (filter: UserFilter | undefined) => {
    return {
        ...filter,
        roles: filter?.roles?.map(({ value }) => value).join(','),
    }
}
