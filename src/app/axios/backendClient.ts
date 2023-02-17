import axios from 'axios'

const baseURL = process.env.REACT_APP_API_URL
const backendClient = axios.create({ baseURL })


backendClient.interceptors.request.use((config) => {
    return config
})


backendClient.interceptors.response.use((config) => {
    return config
})

export default backendClient