import backendClient from "../backendClient";
import { ResetPassword, User, UsernamePassword } from "../../models/interfaces/user";
import axios, { AxiosResponse } from "axios";

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
export const getAllUsers = () : Promise<User[]> => {
    return backendClient.get('user/all')
}
export const updateYourProfile = (user:User) : Promise<User> => {
    return backendClient.put('user/profile/edit', user)
}
export const changePassword = ({password,oldPassword}:ResetPassword) : Promise<void> => {
    return backendClient.put('user/profile/edit/password', {newPassword:password,oldPassword})
}
export const createWorkerUser = (user:User) : Promise<User> => {
    return backendClient.post('user/admin/create',user)
}
export const createClient = (user:User) : Promise<User> => {
    return backendClient.post('user/create/client',user)
}
