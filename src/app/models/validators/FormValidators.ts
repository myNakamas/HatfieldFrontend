import * as Yup from 'yup'
import { User } from '../interfaces/user'
import { UserRoles } from '../enums/userEnums'
import { InventoryItem } from '../interfaces/shop'

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
    email: Yup.string().email('Invalid email').required('Required'),
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

export const AddItemInventorySchema = Yup.object<InventoryItem>().shape({
    model: Yup.object().notRequired(),
    brand: Yup.object().notRequired(),
    count: Yup.number().min(1, 'Invalid count').required('Item count is required'),
})
export const EditItemInventorySchema = Yup.object<InventoryItem>().shape({
    model: Yup.string().notRequired(),
    brand: Yup.string().notRequired(),
    count: Yup.number().min(1, 'Invalid count').required('Item count is required'),
})
export const CategorySchema = Yup.object().shape({
    name: Yup.string().required(),
    itemType: Yup.string().required(),
    phones: Yup.array().of(Yup.string().required()).notRequired(),
})
export const ShopSchema = Yup.object().shape({
    shopName: Yup.string().required(),
    address: Yup.string().required('Required field'),
    phone: Yup.string().min(10, 'Not a valid phone number').required('Required field'),
    email: Yup.string().email('Must be a valid email!').required('Required field'),
    vatNumber: Yup.string().required('Required field'),
    regNumber: Yup.string().required('Required field'),
    shopSettingsView: Yup.object().shape({
        primaryColor: Yup.string().required('Required field'),
        secondaryColor: Yup.string().required('Required field'),
        gmail: Yup.string().email('Must be a valid email').required('Required field'),
        gmailPassword: Yup.string().notRequired(),
        smsApiKey: Yup.string().notRequired(),
    }),
})
export const UsedItemSchema = Yup.object().shape({
    itemId: Yup.number().required(),
    ticketId: Yup.number().required(),
    count: Yup.number().min(1, 'Must be over 0').required(),
})
