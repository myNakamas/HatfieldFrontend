import { Shop } from './shop';
import { ItemPropertyView } from './generalModels';
import { TicketStatus } from '../enums/ticketEnums';

export interface Filter {
    searchBy?: string
    from?: string
    to?: string
}

export interface UserFilter extends Filter {
    shop?: Shop
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
}

export interface TicketFilter extends Filter {
    searchBy?: string;
    modelId?: number;
    brandId?: number;
    deviceLocation?: number;
    shopId?: number;
    clientId?: string;
    createdById?: string;
    createdBefore?: string;
    createdAfter?: string;
    deadlineBefore?: string;
    deadlineAfter?: string;
    ticketStatuses?: TicketStatus[];
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
