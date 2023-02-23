import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { AppWrapper } from '../components/navigation/AppWrapper'

export const PrivateRoute = () => {
    const { loggedUser } = useContext(AuthContext)
    const location = useLocation()

    return !loggedUser ? (
        <Navigate to='/login' state={{ from: location }} />
    ) : (
        <AppWrapper>
            <Outlet />
        </AppWrapper>
    )
}
