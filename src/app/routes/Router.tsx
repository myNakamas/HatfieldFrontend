import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { Profile } from '../pages/users/Profile'
import { Chats } from '../pages/shop/tickets/Chats'
import { Tickets } from '../pages/shop/tickets/Tickets'
import { Users } from '../pages/users/Users'
import { ChangePassword } from '../pages/users/ChangePassword'
import { Shops } from '../pages/shop/Shops'
import { ShopView } from '../pages/shop/ShopView'
import { CategorySettings } from '../pages/settings/CategorySettings'
import { Dashboard } from '../pages/dashboard/Dashboard'
import { Invoices } from '../pages/invoices/Invoices'
import { Clients } from '../pages/users/Clients'
import { InvoiceView } from '../pages/invoices/InvoiceView'
import { WelcomePage } from '../pages/WelcomePage'
import { EditShoppingList } from '../pages/shop/EditShoppingList'
import { ShoppingListView } from '../components/modals/inventory/ShoppingListView'
import { Inventory } from '../pages/shop/Inventory'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/welcome' element={<WelcomePage />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/inventory' element={<Inventory />} />
                <Route path='/inventory/:shopId/shopping-list' element={<ShoppingListView />} />
                <Route path='/inventory/required' element={<EditShoppingList />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/profile/change-password' element={<ChangePassword />} />
                <Route path='/users' element={<Users />} />
                <Route path='/clients' element={<Clients />} />
                <Route path='/chats' element={<Chats />} />
                <Route path='/shops' element={<Shops />} />
                <Route path='/shops/:id' element={<ShopView />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/invoices' element={<Invoices />} />
                <Route path='/invoices/:id' element={<InvoiceView />} />
                <Route path='/categories' element={<CategorySettings />} />
            </Route>
        </Routes>
    )
}
