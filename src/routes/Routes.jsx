import {Navigate, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {useEffect, useContext} from "react";
import LoginScreen from "../screens/auth/SignInScreen";
import {TransactionsScreen} from "../screens/home/TransactionsScreen";
import { DashboardScreen } from "../screens/home/dashboard/DashboardPage";
import { AIAssistiveReportingScreen } from "../screens/home/AIAssistiveReportingScreen";
import { PermissionsContext } from '../screens/layout/PermissionsContext';
import { UserAccountScreen } from "../screens/home/UserAccountScreen";
import { ParkingSessionsScreen } from "../screens/home/ParkingSessionsScreen";
import { ParkingLocationsScreen } from "../screens/home/parking-locations/ParkingLocationsScreen";
import {ReportScreen} from "../screens/home/ReportScreen";
import { ValetSettingsScreen } from "../screens/home/valet-settings/ValetSettingsScreen";
import { ParkingsScreen } from "../screens/home/ParkingsScreen";


const withPermissions = (Component) => () => {
    const permissions = useContext(PermissionsContext);
    const formattedPermissions = {};
    if (Array.isArray(permissions)) {
        permissions.forEach(p => {
            const permName = p.name || p;
            if (permName) formattedPermissions[permName] = true;
        });
    }
    return <Component permissions={formattedPermissions} />;
};

const UserAccountScreenWithPermissions = withPermissions(UserAccountScreen);

const LoginGuard = () => {
    const { token, authChecked } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authChecked && token) {
            const from = location.state?.from?.pathname || '/home/parkings';
            navigate(from, { replace: true });
        }
    }, [token, authChecked, navigate, location]);

    if (!authChecked) return <div>Loading...</div>;
    return token ? null : <LoginScreen />;
};

export const Routes = {
    AuthRoutes: {
        Login: {
            path: '/login',
            element: <LoginGuard />
        },
    },
    MainRoutes: {
        Dashboard: {
            path: '/home/dashboard',
            element: <DashboardScreen />
        },
        Transactions: {
            path: '/home/transactions',
            element: <TransactionsScreen />
        },
        UserAccounts: {
            path: '/home/user-accounts',
            element: <UserAccountScreenWithPermissions />
        },
        AIAssistiveReporting: {
            path: '/home/ai-reporting',
            element: <AIAssistiveReportingScreen />
        },
        ParkingSessions: {
            path: '/home/parking-sessions',
            element: <ParkingSessionsScreen />
        },
        Parkings: {
            path: '/home/parkings',
            element: <ParkingsScreen />
        },
        ParkingLocations: {
            path: '/home/parking-locations',
            element: <ParkingLocationsScreen />
        },
        Report: {
            path: '/home/report',
            element: <ReportScreen />
        },
        ValetSettings: {
            path: '/home/valet-settings',
            element: <ValetSettingsScreen />
        },
        Fallback: {
            path: '*',
            element: <Navigate to="/home/parkings" replace />
        },
    }
};
