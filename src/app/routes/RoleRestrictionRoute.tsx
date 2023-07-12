import { ClientDashboard } from '../pages/client_dashboard/ClientDashboard'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Role } from '../models/enums/userEnums'
import { Navigate, Outlet } from 'react-router-dom'
import { CustomSuspense } from '../components/CustomSuspense'

export const HomePage = () => {
    const { isClient } = useContext(AuthContext)
    return isClient() ? <ClientDashboard /> : <Dashboard />
}

export const RoleRestrictionRoute = ({ role }: { role: Role[] }) => {
    const { loggedUser } = useContext(AuthContext)
    return (
        <CustomSuspense isReady={!!loggedUser}>
            {loggedUser && role.includes(loggedUser.role) ? <Outlet /> : <Navigate to='/denied' />}
        </CustomSuspense>
    )
}
