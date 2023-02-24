import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { Profile } from '../pages/Profile'
import { Chats } from '../pages/shop/Chats'
import { Tickets } from '../pages/shop/Tickets'
import { Inventory } from '../pages/shop/Inventory'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/welcome' element={<div>WELCOME!</div>} />
                <Route path='/dashboard' element={<div>Dashy dash</div>} />
                <Route path='/inventory' element={<Inventory />} />
                <Route path='/profile/{id}' element={<Profile />} />
                <Route path='/users' element={<div>whoa, lots of users</div>} />
                <Route path='/chats' element={<Chats />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/ticket/{id}' element={<div>single ticket info, can open chat</div>} />
                <Route path='/settings' element={<div>All settings for all shops?</div>} />
            </Route>
        </Routes>
    )
}
