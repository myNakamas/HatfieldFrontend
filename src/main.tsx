import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './app/contexts/AuthContext'
import { DevSupport } from '@react-buddy/ide-toolbox'
import { ComponentPreviews, useInitial } from './dev'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <DevSupport ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
                    <App />
                </DevSupport>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
