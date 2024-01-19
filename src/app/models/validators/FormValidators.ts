import * as Yup from 'yup'
import { User } from '../interfaces/user'
import { UserRoles } from '../enums/userEnums'
import { InventoryItem } from '../interfaces/shop'
import { InvoiceTypes, PaymentMethods, WarrantyPeriods } from '../enums/invoiceEnums'

export const LoginSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
})
export const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(5, 'Minimum of 5 characters required!')
        .max(50, 'Too Long!')
        .required('Password is required'),
    passwordConfirmation: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
    oldPassword: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
})
export const SetPasswordSchema = Yup.object().shape({
    password: Yup.string()
        .min(5, 'Minimum of 5 characters required!')
        .max(50, 'Too Long!')
        .required('Password is required'),
    passwordConfirmation: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match'),
})
export const ForgotPasswordSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Minimum of 5 characters required!'),
})
export const SimpleUserSchema = Yup.object<User>().shape({
    userId: Yup.string().notRequired(),
    username: Yup.string().min(5, 'Minimum of 5 characters required!').max(50, 'Too Long!').required('Required'),
    fullName: Yup.string().notRequired(),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    role: Yup.string().oneOf(UserRoles).required(),
    phones: Yup.array().of(Yup.string().min(10, 'Not a valid phone number')).notRequired(),
    shopId: Yup.number().notRequired(),
})
export const ClientSchema = Yup.object().shape({
    fullName: Yup.string().notRequired(),
    email: Yup.string().email('Invalid email').notRequired(),
    role: Yup.string().oneOf(UserRoles).required(),
    phones: Yup.array().of(Yup.string().min(10, 'Not a valid phone number')).notRequired(),
    shopId: Yup.number().notRequired(),
})
export const EditUserSchema = Yup.object<User>().shape({
    userId: Yup.string().notRequired(),
    username: Yup.string().min(5, 'Minimum of 5 characters required!').max(50, 'Too Long!').required('Required'),
    fullName: Yup.string().notRequired(),
    email: Yup.string().email('Invalid email').required('Required'),
    role: Yup.string().oneOf(UserRoles).required(),
    phones: Yup.array().of(Yup.string().min(10, 'Not a valid phone number')).notRequired(),
    shopId: Yup.number().notRequired(),
})
const INT_MAX_VALUE = 2147483647;
export const AddItemInventorySchema = Yup.object<InventoryItem>().shape({
    model: Yup.object().notRequired(),
    brand: Yup.object().notRequired(),
    purchasePrice: Yup.string().nullable().optional(),
    sellPrice: Yup.string().nullable().optional(),
    count: Yup.number()
        .typeError('Please enter a valid number')
        .min(0, 'Invalid count')
        .max(INT_MAX_VALUE, 'Count is too large')
        .required('Item count is required'),
})
export const EditItemInventorySchema = Yup.object<InventoryItem>().shape({
    model: Yup.string().notRequired(),
    brand: Yup.string().notRequired(),
    count: Yup.number()
        .min(0, 'Invalid count')
        .max(INT_MAX_VALUE, 'Count is too large')
        .required('Item count is required'),
})
export const UpdateItemCountSchema = Yup.object<InventoryItem>().shape({
    count: Yup.number().min(0, 'Invalid count').required('Item count is required'),
})
export const EditRequiredItemSchema = Yup.object<InventoryItem>().shape({
    requiredItem: Yup.object().shape({
        requiredAmount: Yup.number().min(0, 'Not a valid number').required('Each item must have a required count'),
    }),
})
export const CategorySchema = Yup.object().shape({
    name: Yup.string().required(),
    itemType: Yup.string().required(),
    columns: Yup.array()
        .of(
            Yup.object()
                .shape({
                    name: Yup.string().matches(
                        /^[a-zA-Z0-9\-_)( ]*$/,
                        () => `Invalid value. This field must not contain special characters.`
                    ),
                })
                .notRequired()
        )
        .notRequired(),
})
export const ShopSchema = Yup.object().shape({
    shopName: Yup.string().required(),
    address: Yup.string().required('Required field'),
    phone: Yup.string().min(10, 'Not a valid phone number').required('Required field'),
    email: Yup.string().email('Must be a valid email!').required('Required field'),
    regNumber: Yup.string().notRequired(),
    vatNumber: Yup.string().notRequired(),
    shopSettingsView: Yup.object().shape({
        primaryColor: Yup.string().required('Required field'),
        secondaryColor: Yup.string().required('Required field'),
        gmail: Yup.string().email('Must be a valid email').notRequired(),
        gmailPassword: Yup.string().notRequired(),
        smsApiKey: Yup.string().notRequired(),
    }),
})
export const CreateShopSchema = Yup.object().shape({
    shopName: Yup.string().required(),
    address: Yup.string().required('Required field'),
    phone: Yup.string().min(10, 'Not a valid phone number').required('Required field'),
    email: Yup.string().email('Must be a valid email!').required('Required field'),
    shopSettingsView: Yup.object().shape({
        primaryColor: Yup.string().required('Required field'),
        secondaryColor: Yup.string().required('Required field'),
    }),
})

export const UsedItemSchema = Yup.object().shape({
    itemId: Yup.number().required(),
    ticketId: Yup.number().required(),
    count: Yup.number().min(1, 'Must be over 0').required(),
})
export const NewInvoiceSchema = Yup.object().shape({
    type: Yup.string().oneOf(InvoiceTypes).required(),
    deviceModel: Yup.string().notRequired(),
    deviceBrand: Yup.string().notRequired(),
    serialNumber: Yup.string().notRequired(),
    notes: Yup.string().notRequired(),
    totalPrice: Yup.number().positive().required('Total price must be a valid number'),
    clientId: Yup.string().notRequired(),
    paymentMethod: Yup.string().oneOf(PaymentMethods).required(),
    warrantyPeriod: Yup.string().oneOf(WarrantyPeriods).required(),
})
export const TicketInvoiceSchema = Yup.object().shape({
    ticketId: Yup.number().required(),
    notes: Yup.string().notRequired(),
    totalPrice: Yup.number().required(),
    clientId: Yup.string().notRequired(),
    paymentMethod: Yup.string().oneOf(PaymentMethods).required(),
    warrantyPeriod: Yup.string().oneOf(WarrantyPeriods).required(),
})

export const SendItemToShopSchema = Yup.object().shape({
    shopId: Yup.number().required(),
    count: Yup.number().min(1).required(),
})
