import { Router } from './app/routes/Router'
import { ThemeProvider } from './app/contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from 'react-query'
import './styles/main.sass'

export const App = () => {
    const client = new QueryClient()

    return (
        <QueryClientProvider client={client}>
            <ThemeProvider>
                <Router />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
