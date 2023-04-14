import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket'
import { faShoppingBag } from '@fortawesome/free-solid-svg-icons/faShoppingBag'
import { faCommentsDollar } from '@fortawesome/free-solid-svg-icons/faCommentsDollar'
import { faMoneyBill } from '@fortawesome/free-solid-svg-icons/faMoneyBill'
import { faCreditCard } from '@fortawesome/free-solid-svg-icons/faCreditCard'
import { faDollar } from '@fortawesome/free-solid-svg-icons/faDollar'
import { faHeadset } from '@fortawesome/free-solid-svg-icons/faHeadset'

export type InvoiceType = 'REPAIR' | 'BUY' | 'SELL' | 'ACCESSORIES'
export const InvoiceTypes = Array('REPAIR', 'BUY', 'SELL', 'ACCESSORIES')
export const InvoiceTypesArray = InvoiceTypes.map((value, index) => ({ value, id: index }))

export type PaymentMethod = 'CASH' | 'CARD' | 'COMBINED'
export const PaymentMethods = Array('CASH', 'CARD', 'COMBINED')
export const PaymentMethodList = PaymentMethods.map((value, index) => ({ value, id: index }))
export type WarrantyPeriod =
    | 'NONE'
    | 'ONE_DAY'
    | 'THREE_DAYS'
    | 'ONE_WEEK'
    | 'TWO_WEEKS'
    | 'ONE_MONTH'
    | 'THREE_MONTHS'
    | 'SIX_MONTHS'
    | 'ONE_YEAR'
    | 'TWO_YEARS'
export const WarrantyPeriods = Array(
    'NONE',
    'ONE_DAY',
    'THREE_DAYS',
    'ONE_WEEK',
    'TWO_WEEKS',
    'ONE_MONTH',
    'THREE_MONTHS',
    'SIX_MONTHS',
    'ONE_YEAR',
    'TWO_YEARS'
)
export const WarrantyPeriodList = WarrantyPeriods.map((value, index) => ({ value, id: index }))

export const invoiceTypeIcon = {
    REPAIR: faTicket,
    BUY: faShoppingBag,
    SELL: faCommentsDollar,
    ACCESSORIES: faHeadset,
}

export const paymentMethodIcon = {
    CASH: faMoneyBill,
    CARD: faCreditCard,
    COMBINED: faDollar,
}
