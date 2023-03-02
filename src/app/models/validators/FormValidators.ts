import * as Yup from "yup";
import { User } from "../interfaces/user";
import { UserRoles } from "../enums/userEnums";

export const LoginSchema = Yup.object().shape({
    username: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
    password: Yup.string().min(5, 'Too Short!').max(50, 'Too Long!').required('Required'),
})
export const ResetPasswordSchema = Yup.object().shape({
    password: Yup.string().min(5, 'Minimum of 5 characters required!').max(50, 'Too Long!').required('Password is required'),
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
    //todo: maybe do a phone regex and dont save if empty
    phones: Yup.array().of(Yup.string().min(10,"Not a valid phone number")).notRequired(),
    shopId: Yup.number().notRequired(),
})

export const AddItemInventorySchema = Yup.object().shape({
    model: Yup.object().notRequired(),
    brand: Yup.object().notRequired(),
    count: Yup.number().min(1, 'Invalid number').required('Required'),
    type: Yup.object().required(),
})
