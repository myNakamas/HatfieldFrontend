export type ItemTypes = 'DEVICE' | 'PART'

export const ItemTypes = ['DEVICE', 'PART']

export const ItemTypesArray = ItemTypes.map((value, index) => ({ id: index, value }))
