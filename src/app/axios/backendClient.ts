import axios, { AxiosError } from "axios";
import { AppError } from "../models/interfaces/generalModels";

const baseURL = import.meta.env.VITE_API_URL
const backendClient = axios.create({ baseURL: String(baseURL) })

backendClient.interceptors.request.use((config) => {
    config.headers.Authorization = localStorage.getItem('token')
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
        return Promise.reject(error.response?.data.detail);
    }
)

export default backendClient
