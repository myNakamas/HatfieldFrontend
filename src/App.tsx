import './app/styles/App.css'
import { Router } from './app/routes/Router'
import { AuthProvider } from './app/contexts/AuthContext'
import { createTheme, ThemeProvider } from '@mui/material/styles'

export const App = () => {
    const theme = createTheme({ palette: {} })

    return (
        <ThemeProvider theme={theme}>
            <AuthProvider>
                <Router />
            </AuthProvider>
        </ThemeProvider>
    )
}
