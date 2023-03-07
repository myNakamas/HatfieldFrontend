import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { AppWrapper } from "../components/navigation/AppWrapper";

export const PrivateRoute = () => {
    const { isLoggedIn } = useContext(AuthContext)
    const location = useLocation()

    return !isLoggedIn ? (
        <Navigate to='/login' state={{ from: location }} />
    ) : (
        <AppWrapper>
            <Outlet />
        </AppWrapper>
    )
}
