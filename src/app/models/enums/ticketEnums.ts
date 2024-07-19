import { TagProps } from 'antd'
import { ItemPropertyView } from '../interfaces/generalModels'

//Todo: get from the backend ( initial config )
export const DeviceLocation = ['IN_THE_FRONT', 'IN_STORAGE', 'IN_LAB']
export const DeviceLocationArray = DeviceLocation.map((value, index) => ({ id: index, value }))

export type TicketStatus =
    | 'PENDING'
    | 'STARTED'
    | 'DIAGNOSED'
    | 'WAITING_FOR_PARTS'
    | 'ON_HOLD'
    | 'EXPECTING_ARRIVAL'
    | 'FINISHED'
    | 'UNFIXABLE'
    | 'SHIPPED_TO_CUSTOMER'
    | 'COLLECTED'
export const TicketStatuses: TicketStatus[] = [
    'PENDING',
    'STARTED',
    'DIAGNOSED',
    'WAITING_FOR_PARTS',
    'ON_HOLD',
    'EXPECTING_ARRIVAL',
    'FINISHED',
    'UNFIXABLE',
    'SHIPPED_TO_CUSTOMER',
    'COLLECTED',
]
export const TicketStatusesArray = TicketStatuses.map((value, index) => ({ id: index, value }))
export const activeTicketStatuses: TicketStatus[] = ['EXPECTING_ARRIVAL', 'PENDING', 'STARTED', 'DIAGNOSED']
export const waitingTicketStatuses: TicketStatus[] = ['WAITING_FOR_PARTS', 'ON_HOLD']
export const completedTicketStatuses: TicketStatus[] = ['FINISHED', 'UNFIXABLE']
export const collectedTicketStatuses: TicketStatus[] = ['COLLECTED', 'SHIPPED_TO_CUSTOMER']

export const ticketStatusCategory: { [key: string]: TicketStatus[] } = {
    '1': activeTicketStatuses,
    '2': waitingTicketStatuses,
    '3': completedTicketStatuses,
    '4': collectedTicketStatuses,
}
export const getTicketStatusColor = (status: TicketStatus): TagProps['color'] => {
    if (collectedTicketStatuses.includes(status)) return 'geekblue'
    if (waitingTicketStatuses.includes(status)) return 'blue'
    if (activeTicketStatuses.includes(status)) return 'orange'
    if (completedTicketStatuses.includes(status)) return 'green'
    return 'default'
}


export const ticketTasks = [
    {key:'option_fix', value:'Fix device',label:'Fix device'},
    {key:'option_estimate', value:'Estimate price of repair',label:'Estimate price of repair'}
]