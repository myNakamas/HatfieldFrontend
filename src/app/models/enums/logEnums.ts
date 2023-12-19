export type LogType =
    | 'CREATED_TICKET'
    | 'UPDATED_TICKET'
    | 'STARTED_TICKET'
    | 'FINISHED_TICKET'
    | 'COLLECTED_TICKET'
    | 'CREATED_CATEGORY'
    | 'UPDATED_CATEGORY'
    | 'DELETED_CATEGORY'
    | 'ADD_NEW_ITEM_TO_INVENTORY'
    | 'ADD_ITEM_TO_SHOPPING_LIST'
    | 'REMOVE_ITEM_FROM_SHOPPING_LIST'
    | 'USED_PART'
    | 'SOLD_ITEM'
    | 'UPDATE_ITEM_COUNT'
    | 'UPDATE_ITEM'
    | 'DAMAGED_PART'
    | 'DEFECTIVE_PART'
    | 'RETURNED_DEFECTIVE_PART'
    | 'CREATED_SELL_INVOICE'
    | 'CREATED_REPAIR_INVOICE'
    | 'CREATED_BUY_INVOICE'
    | 'CREATED_ACCESSORIES_INVOICE'
    | 'CREATED_DEPOSIT_INVOICE'
    | 'INVALIDATED_INVOICE'
    | 'CREATED_WORKER'
    | 'CREATED_CLIENT'
    | 'UPDATED_USER'
    | 'BANNED_USER'
    | 'UNBANNED_USER'
    | 'DELETED_USER'
    | 'RESTORED_USER'

export const LogType = Array(
    'CREATED_TICKET',
    'UPDATED_TICKET',
    'STARTED_TICKET',
    'FINISHED_TICKET',
    'COLLECTED_TICKET',
    'CREATED_CATEGORY',
    'UPDATED_CATEGORY',
    'DELETED_CATEGORY',
    'ADD_NEW_ITEM_TO_INVENTORY',
    'ADD_ITEM_TO_SHOPPING_LIST',
    'REMOVE_ITEM_FROM_SHOPPING_LIST',
    'USED_PART',
    'SOLD_ITEM',
    'UPDATE_ITEM_COUNT',
    'UPDATE_ITEM',
    'DAMAGED_PART',
    'DEFECTIVE_PART',
    'RETURNED_DEFECTIVE_PART',
    'CREATED_SELL_INVOICE',
    'CREATED_REPAIR_INVOICE',
    'CREATED_BUY_INVOICE',
    'CREATED_ACCESSORIES_INVOICE',
    'CREATED_DEPOSIT_INVOICE',
    'INVALIDATED_INVOICE',
    'CREATED_WORKER',
    'CREATED_CLIENT',
    'UPDATED_USER',
    'BANNED_USER',
    'UNBANNED_USER',
    'DELETED_USER',
    'RESTORED_USER'
)

export const LogTypeList = LogType.map((value, index) => ({ value, id: index }))

export const LogTypeText: { [key: string]: string } = {
    CREATED_TICKET: 'Ticket created',
    UPDATED_TICKET: 'Ticket updated',
    STARTED_TICKET: 'Ticket started',
    FINISHED_TICKET: 'Ticket finished',
    COLLECTED_TICKET: 'Ticket collected',
    CREATED_CATEGORY: 'Category created',
    UPDATED_CATEGORY: 'Category updated',
    DELETED_CATEGORY: 'Category deleted',
    ADD_NEW_ITEM_TO_INVENTORY: 'New item added to inventory',
    ADD_ITEM_TO_SHOPPING_LIST: 'Item added to shopping list',
    REMOVE_ITEM_FROM_SHOPPING_LIST: 'Item removed from shopping list',
    USED_PART: 'Part used',
    SOLD_ITEM: 'Item sold',
    UPDATE_ITEM_COUNT: 'Item count updated',
    UPDATE_ITEM: 'Item updated',
    DAMAGED_PART: 'Part damaged',
    DEFECTIVE_PART: 'Part defective',
    RETURNED_DEFECTIVE_PART: 'Defective part returned',
    CREATED_SELL_INVOICE: 'Sell invoice created',
    CREATED_REPAIR_INVOICE: 'Repair invoice created',
    CREATED_BUY_INVOICE: 'Buy invoice created',
    CREATED_ACCESSORIES_INVOICE: 'Accessories invoice created',
    CREATED_DEPOSIT_INVOICE: 'Deposit invoice created',
    INVALIDATED_INVOICE: 'Invoice invalidated',
    CREATED_WORKER: 'Worker created',
    CREATED_CLIENT: 'Client created',
    UPDATED_USER: 'User updated',
    BANNED_USER: 'User banned',
    UNBANNED_USER: 'User unbanned',
    DELETED_USER: 'User deleted',
    RESTORED_USER: 'User restored',
}