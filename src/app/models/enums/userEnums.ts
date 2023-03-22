import { ItemPropertyView } from '../interfaces/generalModels'

export type Role = 'ADMIN' | 'CLIENT' | 'SALESMAN' | 'ENGINEER'
export const UserRoles = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER')
export const UserRolesArray: ItemPropertyView[] = Array('ADMIN', 'CLIENT', 'SALESMAN', 'ENGINEER').map(
    (value, index) => ({
        id: index,
        value,
    })
)
