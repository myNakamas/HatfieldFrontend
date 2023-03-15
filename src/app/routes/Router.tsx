import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { Profile } from '../pages/users/Profile'
import { Chats } from '../pages/shop/tickets/Chats'
import { Tickets } from '../pages/shop/tickets/Tickets'
import { Inventory } from '../pages/shop/Inventory'
import { Users } from '../pages/users/Users'
import { ChangePassword } from '../pages/users/ChangePassword'
import { Shops } from '../pages/shop/Shops'
import { ShopView } from '../pages/shop/ShopView'
import { CategorySettings } from '../pages/settings/CategorySettings'
import { Dashboard } from '../pages/dashboard/Dashboard'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/welcome' element={<div>WELCOME!</div>} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/inventory' element={<Inventory />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/profile/change-password' element={<ChangePassword />} />
                <Route path='/users' element={<Users />} />
                <Route path='/clients' element={<div>moneh</div>} />
                <Route path='/chats' element={<Chats />} />
                <Route path='/shops' element={<Shops />} />
                <Route path='/shops/:id' element={<ShopView />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/ticket/:id' element={<div>single ticket info, can open chat</div>} />
                <Route path='/settings' element={<div>All settings for all shops?</div>} />
                <Route path='/categories' element={<CategorySettings />} />
            </Route>
        </Routes>
    )
}
