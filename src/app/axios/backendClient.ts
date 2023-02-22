import axios, { AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_URL
const backendClient = axios.create({ baseURL: String(baseURL) })

backendClient.interceptors.request.use((config) => {
    config.headers.Authorization = localStorage.getItem('token')
    return config
})

backendClient.interceptors.response.use(
    (config) => {
        return config
    },
    (error: AxiosError) => {
        if (error.status == 401) {
            window.dispatchEvent(new Event('session_expired'))
        }
    }
)

export default backendClient
