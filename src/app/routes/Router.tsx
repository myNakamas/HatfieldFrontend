import { Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { Login } from '../pages/Login'

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/dashboard' />
                <Route path='/profile/{id}' />
                <Route path='/users' />
                <Route path='/welcome' element={<div>WELCOME!</div>} />
                <Route path='/tickets' />
                <Route path='/ticket/{id}' />
                <Route path='/settings' />
            </Route>
        </Routes>
    )
}