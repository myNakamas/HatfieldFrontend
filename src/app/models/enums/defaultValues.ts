import { CreateTicket } from '../interfaces/ticket'
import { User } from '../interfaces/user'
import { TicketFilter } from '../interfaces/filters'
import moment from 'moment/moment'
import { PageRequest } from '../interfaces/generalModels'

export const defaultPage: PageRequest = { pageSize: 10, page: 1 }

export const defaultTicket = {
    status: 'PENDING',
    deviceLocation: 'IN_THE_FRONT',
} as CreateTicket

export const defaultUser = {
    phones: [] as string[],
    smsPermission: true,
    emailPermission: true,
    isActive: true,
    isBanned: false,
} as User

export const getDefaultClient = (shopId?: number) => ({ ...defaultUser, role: 'CLIENT', shopId: shopId } as User)

export const defaultDashboardFilter = (shopId?: number) =>
    ({ shopId:shopId, createdAfter: moment().startOf('month').format('YYYY-MM-DD'), createdBefore: moment().format('YYYY-MM-DD') } as TicketFilter)
