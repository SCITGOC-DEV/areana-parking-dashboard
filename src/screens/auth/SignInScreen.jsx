import { useState } from 'react';
import AppButton from "../../components/AppButton";
import { useMutation } from "@apollo/client";
import auth from "../../graphql/mutation/auth";
import { useToast } from "../../context/ToastProvider";
import { setAuthToken } from "../../utils/token";
import { useAuth } from "../../context/AuthContext";
import { Watermark } from "../../components/Watermark";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast()
    const { handleTokenChange } = useAuth()
    const navigate = useNavigate()

    // Permission groups that map to specific pages
    const reportTabPermissions = [
        'senior_citizen_report',
        'pwd_report',
        'sale_report',
        'bir_pos_sales_report',
        'z_report_histories',
        'x_reading',
        'all_vehicle_route',
    ];

    const userAccountPermissions = [
        'dashboard_permission',
        'dashboard_dispatcher',
        'dashboard_staff'
    ];

    const busOperationPermissions = [
        'route',
        'bus_stop',
        'bus',
        'vehicle_in_transit',
        'route_running_status',
        'route_analytics_summary',
        'bus_analytics_summary',
    ];

    const operationReportPermissions = [
        'stationary_report',
        'bus_trip_report',
        'pos_sale_report',
        'unused_ticket_pos',
        'used_ticket_pos',
        'used_ticket_qr',
        'z_reading_report'
    ];

    // Permission to route mapping
    const permissionRouteMap = {
        'dashboard': '/home/dashboard',
        'reload_history': '/home/topup-history',
        'transaction': '/home/transactions',
        'card': '/home/card',
        'ai_assistive_reporting': '/home/ai-reporting',
    };

    const [login] = useMutation(auth.SIGN_IN, {
        onCompleted: (data) => {
            const response = data.response;
            if (response.success) {
                handleTokenChange(response.data.token);

                // Decode token to get user permissions
                try {
                    const decoded = jwtDecode(response.data.token);
                    const userPermissions = decoded?.hasura?.all_permissions || [];

                    console.log('User permissions:', userPermissions);

                    let redirectPath = '/home/parkings'; // Default fallback

                    // Check permission groups first (these take priority)
                    if (operationReportPermissions.some(perm => userPermissions.includes(perm))) {
                        redirectPath = '/home/operation-reports';
                    } else if (reportTabPermissions.some(perm => userPermissions.includes(perm))) {
                        redirectPath = '/home/report';
                    } else if (userAccountPermissions.some(perm => userPermissions.includes(perm))) {
                        redirectPath = '/home/user-accounts';
                    } else if (busOperationPermissions.some(perm => userPermissions.includes(perm))) {
                        redirectPath = '/home/bus-operations';
                    } else {
                        // Check individual permission mappings
                        for (const permission of userPermissions) {
                            if (permissionRouteMap[permission]) {
                                redirectPath = permissionRouteMap[permission];
                                break;
                            }
                        }
                    }

                    console.log('Redirecting to:', redirectPath);
                    navigate(redirectPath, { replace: true });
                } catch (error) {
                    console.error('Error decoding token:', error);
                    // Fallback to dashboard if token decode fails
                    navigate('/home/parking-sessions', { replace: true });
                }
            } else {
                addToast(response.message, "error");
            }
            setIsLoading(false)
        },
        onError: (error) => {
            setIsLoading(false)
            console.log('error', error.message)
            addToast(error.message, "error");
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        login({
            variables: {
                userName: email,
                password: password,
            }
        })
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative">
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
                {/*<Watermark />*/}
            </div>
            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Header Section */}
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Sign in to your account
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 sm:p-8 transition-colors duration-300">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base bg-white dark:bg-gray-700 dark:text-white transition-colors duration-300"
                                autoComplete="email"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base bg-white dark:bg-gray-700 dark:text-white transition-colors duration-300"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                                    Remember for 30 days
                                </label>
                            </div>
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <AppButton
                            loading={isLoading}
                            type="submit"
                        >
                            Sign In
                        </AppButton>


                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300">
                                Sign up
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
