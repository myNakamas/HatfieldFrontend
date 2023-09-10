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
export const TicketStatuses = [
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
export const activeTicketStatuses: TicketStatus[] = ['STARTED', 'PENDING', 'DIAGNOSED']
export const completedTicketStatuses: TicketStatus[] = ['FINISHED', 'UNFIXABLE', 'SHIPPED_TO_CUSTOMER', 'COLLECTED']
export const waitingTicketStatuses: TicketStatus[] = ['FINISHED', 'WAITING_FOR_PARTS', 'ON_HOLD']
