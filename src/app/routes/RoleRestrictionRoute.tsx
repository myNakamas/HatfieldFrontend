import { WelcomePage } from '../pages/WelcomePage'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Role } from '../models/enums/userEnums'
import { Navigate, Outlet } from 'react-router-dom'
import { CustomSuspense } from '../components/CustomSuspense'

export const RoleRestrictionHomeRoute = () => {
    const { isClient } = useContext(AuthContext)
    return isClient() ? <WelcomePage /> : <Dashboard />
}

export const RoleRestrictionRoute = ({ role }: { role: Role[] }) => {
    const { loggedUser } = useContext(AuthContext)
    return (
        <CustomSuspense isReady={!!loggedUser}>
            {loggedUser && role.includes(loggedUser.role) ? <Outlet /> : <Navigate to='/denied' />}
        </CustomSuspense>
    )
}
