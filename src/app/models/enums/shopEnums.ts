export type ItemTypes = 'DEVICE' | 'PART'

export const ItemTypes = ['DEVICE', 'PART', 'ACCESSORIES', 'CABLES', 'OTHER']

export const ItemTypesArray = ItemTypes.map((value, index) => ({ id: index, value }))
