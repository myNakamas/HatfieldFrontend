import { AppOption } from '../interfaces/generalModels'

export type Role = 'ADMIN' | 'CLIENT' | 'SALESMAN' | 'ENGINEER'
export const UserRoles = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER')
export const UserRolesArray: AppOption[] = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER').map((value, index) => ({
    index,
    value,
}))
