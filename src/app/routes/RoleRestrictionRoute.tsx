import { WelcomePage } from '../pages/WelcomePage'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { Role } from '../models/enums/userEnums'
import { Navigate, Outlet } from 'react-router-dom'

export const RoleRestrictionHomeRoute = () => {
    const { loggedUser } = useContext(AuthContext)
    console.log(loggedUser?.role)
    return loggedUser?.role === 'CLIENT' ? <WelcomePage /> : <Dashboard />
}

export const RoleRestrictionRoute = ({ role }: { role: Role[] }) => {
    if (checkRole({ role })) {
        return <Outlet />
    }
    return <Navigate to='/home' />
    //todo : make 403 page
}

export const checkRole = ({ role }: { role: Role[] }) => {
    const { loggedUser } = useContext(AuthContext)
    return loggedUser && role.includes(loggedUser.role)
}
