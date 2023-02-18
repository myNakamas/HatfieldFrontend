import backendClient from './backendClient'
import { LoginUserModel, User } from '../models/interfaces/user'

export const useLogin = ({ username, password, remember }: LoginUserModel): Promise<User> => {
    const rememberMe = remember ? 'on' : 'off'
    const data = new URLSearchParams()
    data.append('username', username)
    data.append('password', password)
    data.append('remember-me', rememberMe)

    return backendClient.post('login', {}, { params: data })
}
