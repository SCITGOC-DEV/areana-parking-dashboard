import {createBrowserRouter, Navigate, Outlet, RouterProvider} from 'react-router-dom';
import {ProtectedRoute} from "../screens/auth/ProtectedRoute";
import {MainLayout} from "../screens/layout/MainLayout";
import {AuthProvider} from "../context/AuthContext";
import {ToastProvider} from "../context/ToastProvider";
import {Routes} from "./Routes";
import AdminsScreen from '../screens/home/admins/AdminsScreen';
import {StaffsScreen} from '../screens/home/staffs/StaffsScreen';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <AuthProvider>
                <ToastProvider>
                    <Outlet />
                </ToastProvider>
            </AuthProvider>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/home/parking-sessions" replace />
            },
            {
                path: Routes.AuthRoutes.Login.path,
                element: Routes.AuthRoutes.Login.element
            },
            {
                path: 'home',
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <MainLayout />,
                        children: [
                            { index: true, element: <Navigate to="dashboard" replace /> },
                            { path: Routes.MainRoutes.Dashboard.path, element: Routes.MainRoutes.Dashboard.element },
                            { path: Routes.MainRoutes.Transactions.path, element: Routes.MainRoutes.Transactions.element },
                            { path: Routes.MainRoutes.UserAccounts.path, element: Routes.MainRoutes.UserAccounts.element },
                            { path: Routes.MainRoutes.ParkingSessions.path, element: Routes.MainRoutes.ParkingSessions.element },
                            { path: Routes.MainRoutes.ParkingLocations.path, element: Routes.MainRoutes.ParkingLocations.element },
                            { path: '/home/admins', element: <AdminsScreen /> },
                            { path: '/home/staffs', element: <StaffsScreen /> },
                            {path: Routes.MainRoutes.Report.path, element: Routes.MainRoutes.Report.element },
                            { path: Routes.MainRoutes.ValetSettings.path, element: Routes.MainRoutes.ValetSettings.element },
                            { path: Routes.MainRoutes.Fallback.path, element: Routes.MainRoutes.Fallback.element },
                        ]
                    }
                ]
            }
        ]
    }
]);

export const AppRoutes = () => <RouterProvider router={router}/>;
