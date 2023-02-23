import { Entity } from './generalModels'

export interface UsernamePassword {
    username: string
    password: string
}

export interface User extends UsernamePassword, Entity {
    fullName: string
    role: string
    email: string
}
