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
export const activeTicketStatuses: TicketStatus[] = ['EXPECTING_ARRIVAL', 'PENDING', 'STARTED', 'DIAGNOSED']
export const waitingTicketStatuses: TicketStatus[] = ['WAITING_FOR_PARTS', 'ON_HOLD']
export const completedTicketStatuses: TicketStatus[] = ['FINISHED', 'UNFIXABLE']
export const collectedTicketStatuses: TicketStatus[] = ['COLLECTED', 'SHIPPED_TO_CUSTOMER']


export const ticketStatusCategory:{[key:string]:TicketStatus[]} = {
    '1':activeTicketStatuses,
    '2':waitingTicketStatuses,
    '3':completedTicketStatuses,
    '4':collectedTicketStatuses
}
