import {Navigate, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from "../../context/AuthContext";
import {useEffect} from "react";

export const ProtectedRoute = () => {
    const { token, authChecked } = useAuth();
    const location = useLocation();

    if (!authChecked) {
        return <div>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};