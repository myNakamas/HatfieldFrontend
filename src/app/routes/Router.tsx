import { Navigate, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { Profile } from '../pages/users/Profile'
import { Chats } from '../pages/shop/Chat/Chats'
import { ChangePassword } from '../pages/users/ChangePassword'
import { Privacy } from '../pages/Privacy'
import { About } from '../pages/About'
import { RoleRestrictionHomeRoute, RoleRestrictionRoute } from './RoleRestrictionRoute'
import { Inventory } from '../pages/shop/Inventory'
import { ShoppingListView } from '../pages/shop/ShoppingListView'
import { EditShoppingList } from '../pages/shop/EditShoppingList'
import { Clients } from '../pages/users/Clients'
import { Tickets } from '../pages/shop/tickets/Tickets'
import { Invoices } from '../pages/invoices/Invoices'
import { InvoiceView } from '../pages/invoices/InvoiceView'
import { CategorySettings } from '../pages/settings/CategorySettings'
import { Logs } from '../pages/Logs'
import { Users } from '../pages/users/Users'
import { Shops } from '../pages/shop/Shops'
import { ShopSettingsView } from '../pages/shop/ShopSettingsView'
import { PageNotFound } from '../pages/PageNotFound'
import { Statistics } from '../pages/Statistics'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/' element={<Navigate to={'/home'} />} />
                <Route path='/home' element={RoleRestrictionHomeRoute()} />
                <Route path='/stats' element={<Statistics />} />
                <Route path='/chats' element={<Chats />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/about' element={<About />} />
                <Route path='/privacy' element={<Privacy />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/notFound' element={<PageNotFound />} />
                <Route path='*' element={<PageNotFound />} />
                <Route path='/profile/change-password' element={<ChangePassword />} />
                <Route path='/invoices/:id' element={<InvoiceView />} />
                <Route path='/' element={<RoleRestrictionRoute role={['ENGINEER', 'SALESMAN', 'ADMIN']} />}>
                    <Route path='/inventory' element={<Inventory />} />
                    <Route path='/inventory/:shopId/shopping-list' element={<ShoppingListView />} />
                    <Route path='/inventory/required' element={<EditShoppingList />} />
                    <Route path='/clients' element={<Clients />} />
                    <Route path='/invoices' element={<Invoices />} />
                    <Route path='/categories' element={<CategorySettings />} />
                    <Route path='/logs' element={<Logs />} />
                </Route>
                <Route path='/' element={<RoleRestrictionRoute role={['ADMIN']} />}>
                    <Route path='/workers' element={<Users />} />
                    <Route path='/shops' element={<Shops />} />
                    <Route path='/shops/:id' element={<ShopSettingsView />} />
                </Route>
            </Route>
        </Routes>
    )
}
