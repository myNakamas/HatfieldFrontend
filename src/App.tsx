import 'regenerator-runtime/runtime'
import { Router } from './app/routes/Router'
import { ThemeProvider } from './app/contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import './styles/main.sass'
import 'react-toastify/dist/ReactToastify.css'
import 'react-datetime/css/react-datetime.css'
import Modal from 'react-modal'
import { App as AntApp } from 'antd'
import { ToastContainer } from 'react-toastify'
import { WebSocketContextProvider } from './app/contexts/WebSocketContext'
import { defaultQueryClientConfig } from './app/axios/reactQueryProps'

export const App = () => {
    const client = new QueryClient(defaultQueryClientConfig)
    Modal.setAppElement('#root')

    return (
        <QueryClientProvider client={client}>
            <WebSocketContextProvider>
                <ThemeProvider>
                    <AntApp>
                        <ToastContainer />
                        <Router />
                    </AntApp>
                </ThemeProvider>
            </WebSocketContextProvider>
        </QueryClientProvider>
    )
}
