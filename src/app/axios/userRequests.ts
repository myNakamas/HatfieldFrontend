import backendClient from './backendClient'
import { LoginUserModel, User } from '../models/interfaces/user'
import { AxiosResponse } from 'axios'

const transformLoginResponse = ({ data: user, headers }: AxiosResponse) => {
    const token = 'Bearer ' + headers['authorization']
    return { user, token }
}

export const useLogin = ({ username, password, remember }: LoginUserModel): Promise<{ user: User; token: string }> => {
    const rememberMe = remember ? 'on' : 'off'
    const data = new URLSearchParams()
    data.append('username', username)
    data.append('password', password)
    data.append('remember-me', rememberMe)

    return backendClient
        .post('login', {}, { params: data, responseType: 'json' })
        .then((value) => transformLoginResponse(value))
}

export const getLoggedUser = (): Promise<User> => {
    return backendClient.get('user/profile')
}
