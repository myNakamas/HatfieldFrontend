import { Entity } from './generalModels'

interface UsernamePassword {
    username: string;
    password: string;
}

export interface LoginUserModel extends UsernamePassword {
    remember?: boolean;
}

export interface User extends UsernamePassword, Entity {
    fullName: string;
    role: string;
    email: string;
}
