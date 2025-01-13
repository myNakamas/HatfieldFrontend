import { App as AntApp } from 'antd'
import ErrorBoundary from 'antd/es/alert/ErrorBoundary'
import 'react-datetime/css/react-datetime.css'
import Modal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import 'regenerator-runtime/runtime'
import { defaultQueryClientConfig } from './app/axios/reactQueryProps'
import { ThemeProvider } from './app/contexts/ThemeContext'
import { WebSocketContextProvider } from './app/contexts/WebSocketContext'
import { Router } from './app/routes/Router'
import './styles/main.sass'

export const App = () => {
    const client = new QueryClient(defaultQueryClientConfig)
    Modal.setAppElement('#root')

    return (
        <QueryClientProvider client={client}>
            <WebSocketContextProvider>
                <ThemeProvider>
                    <AntApp>
                        <ToastContainer />
                        <ErrorBoundary message="Something went wrong" description="Please try again later">
                            <Router />
                        </ErrorBoundary>
                    </AntApp>
                </ThemeProvider>
            </WebSocketContextProvider>
        </QueryClientProvider>
    )
}
