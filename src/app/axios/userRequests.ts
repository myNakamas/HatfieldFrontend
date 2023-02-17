import backendClient from './backendClient'
import { User } from '../models/interfaces/user'

export const useLogin = (params: { username: string; password: string }): Promise<User> => {
    return backendClient.post('/login', {}, { params })
}
