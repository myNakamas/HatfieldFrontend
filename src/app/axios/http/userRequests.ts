import backendClient from '../backendClient'
import { ResetPassword, User, UsernamePassword } from '../../models/interfaces/user'
import axios, { AxiosResponse } from 'axios'
import { toUserFilterView, UserFilter } from '../../models/interfaces/filters'

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
export const getAllUsers = ({ filter }: { filter?: UserFilter }): Promise<User[]> => {
    const userFilter = toUserFilterView(filter)
    return backendClient.get('user/worker/all', { params: userFilter })
}
export const getAllWorkers = ({ filter }: { filter?: UserFilter }): Promise<User[]> => {
    return backendClient.get('user/worker/all/workers', { params: filter })
}
export const getAllClients = ({ filter }: { filter?: UserFilter }): Promise<User[]> => {
    return backendClient.get('user/worker/all/clients', { params: filter })
}
export const updateYourProfile = (user: User): Promise<User> => {
    return backendClient.put('user/profile/edit', user)
}
export const getProfilePicture = ({ id }: { id?: string }): Promise<Blob> => {
    if (!id) return new Promise(() => new Blob())
    return backendClient.get('user/profile/image', { params: { id }, responseType: 'blob' })
}
export const changeProfilePicture = ({ picture }: { picture: File }) => {
    const body = new FormData()
    body.append('image', picture)
    return backendClient.post('user/profile/edit/image', body)
}
export const changePassword = ({ password, oldPassword }: ResetPassword): Promise<void> => {
    return backendClient.put('user/profile/edit/password', { newPassword: password, oldPassword })
}
export const createWorkerUser = (user: User): Promise<User> => {
    return backendClient.post('user/admin/create', user)
}
export const createClient = (user: User): Promise<User> => {
    return backendClient.post('user/worker/client', user)
}
export const updateClient = (user: User): Promise<User> => {
    return backendClient.put('user/worker/client', user)
}
export const updateUser = (user: User): Promise<User> => {
    return backendClient.put('user/admin/update', user)
}
export const banClient = (id: string, status: boolean) => {
    return backendClient.put('user/admin/updateBan', {}, { params: { id, status } })
}
