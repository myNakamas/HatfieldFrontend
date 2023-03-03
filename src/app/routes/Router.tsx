import { Route, Routes } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { Login } from "../pages/Login";
import { Profile } from "../pages/users/Profile";
import { Chats } from "../pages/shop/tickets/Chats";
import { Tickets } from "../pages/shop/tickets/Tickets";
import { Inventory } from "../pages/shop/Inventory";
import { Users } from "../pages/users/Users";
import { ChangePassword } from "../pages/users/ChangePassword";

export const Router = () => {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<PrivateRoute />}>
                <Route path='/welcome' element={<div>WELCOME!</div>} />
                <Route path='/dashboard' element={<div>Dashy dash</div>} />
                <Route path='/inventory' element={<Inventory />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/profile/change-password' element={<ChangePassword />} />
                <Route path='/users' element={<Users />} />
                <Route path='/clients' element={<div>moneh</div>} />
                <Route path='/chats' element={<Chats />} />
                <Route path='/tickets' element={<Tickets />} />
                <Route path='/ticket/{id}' element={<div>single ticket info, can open chat</div>} />
                <Route path='/settings' element={<div>All settings for all shops?</div>} />
            </Route>
        </Routes>
    )
}
