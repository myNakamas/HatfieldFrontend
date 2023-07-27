import { Navigate, Outlet } from 'react-router-dom'
import { AppWrapper } from '../components/navigation/AppWrapper'

export const PrivateRoute = () => {
    const token = localStorage.getItem('token')

    return !token && !location.pathname.includes('login') ? (
        <Navigate to='/login' state={{ from: location }} />
    ) : (
        <AppWrapper>
            <Outlet />
        </AppWrapper>
    )
}
