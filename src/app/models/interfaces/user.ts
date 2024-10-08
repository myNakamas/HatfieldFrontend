import { Role } from '../enums/userEnums'

export interface UsernamePassword {
    username: string
    password: string
}

export interface SetPassword {
    password: string
    passwordConfirmation: string
}

export interface ResetPassword {
    password: string
    passwordConfirmation: string
    oldPassword: string
}

export interface User extends UsernamePassword {
    userId: string
    fullName: string
    firstPass: string
    role: Role
    email: string
    phones: string[]
    shopId: number
    shopName: string
    isActive: boolean
    isBanned: boolean
    smsPermission: boolean
    emailPermission: boolean

    // label does not exist in BE
    label:string;
}

