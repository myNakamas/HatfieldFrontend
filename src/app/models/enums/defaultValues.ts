import { CreateTicket } from '../interfaces/ticket'
import { User } from '../interfaces/user'
import { TicketFilter } from '../interfaces/filters'
import moment from 'moment/moment'
import { PageRequest } from '../interfaces/generalModels'

export const defaultPageSizeOptions = [5, 10, 15, 20, 50, 100]
export const setDefaultPageSize = (pageSize: number) => {
    localStorage.setItem('pageSize', pageSize + '')
}
export const getDefaultPageSize = (): number => {
    const size = localStorage.getItem('pageSize')
    return size ? +size : 10
}
export const defaultPage: PageRequest = { pageSize: getDefaultPageSize(), page: 1 }

export const defaultTicket = {
    problemExplanation: '',
    status: 'PENDING',
    deviceLocation: 'IN_THE_FRONT',
    deadline: moment().add(1, 'hour').toDate(),
} as CreateTicket

export const defaultUser = {
    phones: [''],
    smsPermission: true,
    emailPermission: true,
    isActive: true,
    isBanned: false,
} as User

export const getDefaultClient = (shopId?: number) => ({ ...defaultUser, role: 'CLIENT', shopId: shopId } as User)

export const defaultStatisticsFilter = (shopId?: number) =>
    ({
        shopId: shopId,
        createdAfter: moment().startOf('month').format('YYYY-MM-DD'),
        createdBefore: moment().format('YYYY-MM-DD'),
    } as TicketFilter)
