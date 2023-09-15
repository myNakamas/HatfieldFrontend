import axios, { AxiosError } from 'axios'
import { AppError } from '../models/interfaces/generalModels'
import { toastProps } from '../components/modals/ToastProps'
import { toast } from 'react-toastify'

const baseURL = import.meta.env.VITE_API_URL
const backendClient = axios.create({ baseURL: String(baseURL) })

backendClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = token
    return config
})

backendClient.interceptors.response.use(
    (config) => {
        return config.data
    },
    (error: AxiosError<AppError>) => {
        if (error.response?.status == 401) {
            document.dispatchEvent(new Event('session_expired'))
        }
        if (error.response?.status == 403) {
            toast.error('Oh no! Access denied.', toastProps)
        }
        if (error.response?.status == 404) {
            toast.error("Oh no! Page doesn't exist.", toastProps)
        }
        return Promise.reject(error.response?.data)
    }
)

export default backendClient
