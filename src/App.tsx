import { Router } from "./app/routes/Router";
import { ThemeProvider } from "./app/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "react-query";
import "./styles/main.sass";
import Modal from "react-modal";

export const App = () => {
    const client = new QueryClient()
    Modal.setAppElement('#root')

    return (
        <QueryClientProvider client={client}>
                <ThemeProvider>
                    <Router />
                </ThemeProvider>
        </QueryClientProvider>
    )
}
