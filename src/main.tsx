import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./app/contexts/AuthContext";
import { InfinitySpin } from "react-loader-spinner";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Suspense
                    fallback={
                        <div className='fullPageLoading'>
                            <InfinitySpin color='cyan' />
                        </div>
                    }
                >
                    <App />
                </Suspense>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
)
