import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
const backendClient = axios.create({ baseURL: String(baseURL) })


backendClient.interceptors.request.use((config) => {
    return config
})


backendClient.interceptors.response.use((config) => {
    return config
})

export default backendClient