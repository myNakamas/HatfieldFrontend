import { CreateTicket } from '../interfaces/ticket'
import { User } from '../interfaces/user'

export const defaultTicket = {
    status: 'PENDING',
    deviceLocation: 'IN_THE_FRONT',
} as CreateTicket

export const defaultUser = {
    smsPermission: true,
    emailPermission: true,
    isActive: true,
    isBanned: false,
} as User
