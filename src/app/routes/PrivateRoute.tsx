import { Outlet, useNavigate } from 'react-router-dom'
import { AppWrapper } from '../components/navigation/AppWrapper'
import { useEffect } from 'react'

export const PrivateRoute = () => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    useEffect(() => {
        if (!token && !location.pathname.includes('login')) navigate('/login' )
    }, [token])

    return (
        <AppWrapper>
            <Outlet />
        </AppWrapper>
    )
}
