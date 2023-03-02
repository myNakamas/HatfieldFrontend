import { Role } from '../enums/userEnums'

export interface UsernamePassword {
    username: string
    password: string
}

export interface ResetPassword {
    password: string
    passwordConfirmation: string
    oldPassword: string
}

export interface User extends UsernamePassword {
    userId: string
    fullName: string
    role: Role
    email: string
    phones: string[]
    shopId: number
    //    todo:more fields
}
