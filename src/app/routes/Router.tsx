import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'
import { Profile } from '../pages/Profile'
import { Chats } from '../pages/shop/Chats'
import { Tickets } from '../pages/shop/Tickets'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/welcome' element={<div>WELCOME!</div>} />
                <Route path='/dashboard' />
                <Route path='/profile/{id}' element={<Profile />} />
                <Route path='/users' />
                <Route path='/chats' element={<Chats />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/ticket/{id}' />
                <Route path='/settings' />
            </Route>
        </Routes>
    )
}
