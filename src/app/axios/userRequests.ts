import backendClient from './backendClient'
import { User, UsernamePassword } from '../models/interfaces/user'
import axios, { AxiosResponse } from 'axios'

const transformLoginResponse = ({ data: user, headers }: AxiosResponse) => {
    const token = 'Bearer ' + headers['authorization']
    return { user, token }
}

export const useLogin = ({ username, password }: UsernamePassword): Promise<{ user: User; token: string }> => {
    const backendUrl = import.meta.env.VITE_API_URL
    const data = new URLSearchParams()
    data.append('username', username)
    data.append('password', password)
    return axios
        .post(backendUrl + 'login', {}, { params: data, responseType: 'json' })
        .then((value) => transformLoginResponse(value))
}

export const getLoggedUser = (): Promise<User> => {
    return backendClient.get('user/profile')
}
