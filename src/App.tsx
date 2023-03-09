import 'regenerator-runtime/runtime'
import { Router } from './app/routes/Router'
import { ThemeProvider } from './app/contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import './styles/main.sass'
import 'react-toastify/dist/ReactToastify.css'
import Modal from 'react-modal'
import { ToastContainer } from 'react-toastify'

export const App = () => {
    const client = new QueryClient()
    Modal.setAppElement('#root')

    return (
        <QueryClientProvider client={client}>
            <ThemeProvider>
                <ToastContainer />
                <Router />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
