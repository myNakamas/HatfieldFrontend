import './app/styles/App.scss'
import { Router } from './app/routes/Router'
import { Toolbar } from './app/components/Toolbar'
import { SideNavigation } from './app/components/navigation/SideNavigation'
import { ThemeProvider } from './app/contexts/ThemeContext'
import { QueryClient, QueryClientProvider } from 'react-query'

export const App = () => {
    const client = new QueryClient()

    return (
        <QueryClientProvider client={client}>
            <ThemeProvider>
                <Toolbar />
                <SideNavigation />
                <Router />
            </ThemeProvider>
        </QueryClientProvider>
    )
}
