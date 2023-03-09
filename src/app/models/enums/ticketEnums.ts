export const DeviceLocation = ['IN_THE_FRONT', 'SENT_TO_ANOTHER_LOCATION', 'IN_STORAGE', 'IN_LAB']
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
