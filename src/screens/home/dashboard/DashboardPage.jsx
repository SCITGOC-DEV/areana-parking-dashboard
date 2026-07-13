import React, {useEffect, useState, useMemo} from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { gql, useQuery } from "@apollo/client";
import { useToast } from "../../../context/ToastProvider";
// import {updateHasuraRole} from "../../../api/apolloClient";
import {useAuth} from "../../../context/AuthContext";
import {useTheme} from "../../../context/ThemeContext";

const GET_DASHBOARD_DATA = gql `
query MyQuery {
  response: reportGetRevenueSummary {
    error
    message
    data {
      lastWeek {
        date
        totalCost
        totalDiscount
        totalNetAmount
      }
       thisWeek {
        date
         totalCost
         totalDiscount
        totalNetAmount
       }
       monthly {
         month
         totalCost
         totalDiscount
         totalNetAmount
       }
       yearly {
         year
         totalCost
         totalDiscount
        totalNetAmount
       }
      routeSummary {
        routes {
          percentage
          routeId
          routeName
          totalCost
          totalDiscount
          totalNetAmount
        }
        totaCostAmount
      }
      today {
        totalCost
        totalDiscount
        totalNetAmount
      }
    }
  }
}`

export const DashboardScreen = () => {
    const { addToast } = useToast();
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const { data, loading, error } = useQuery(GET_DASHBOARD_DATA);
    const [chartView, setChartView] = useState('monthly'); // 'daily', 'monthly', 'yearly'

    // Effect to set dashboard role
    useEffect(() => {
        // Role update logic can be added here if needed
    }, []);

    // Check for permission errors
    useEffect(() => {
        const errorResponse = data?.response
        if (errorResponse && (
            (errorResponse.message && (errorResponse.message.includes('403') || errorResponse.message.includes('Permission denied')))
        )) {
            addToast({
                type: 'error',
                message: 'Permission denied. Please logout and login again to refresh your permissions.'
            });

            // Show logout prompt after a delay
            setTimeout(() => {
                if (window.confirm('Your permissions have changed. You need to logout and login again. Would you like to logout now?')) {
                    logout();
                }
            }, 2000);
        }
    }, [data]);

    // Color palette for pie chart
    const pieColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#A21CAF", "#F43F5E", "#F97316"];

    // Prepare data from API with proper null checks
    const thisWeek = data?.response?.data?.thisWeek || [];
    const lastWeek = data?.response?.data?.lastWeek || [];
    const thisMonth = data?.response?.data?.monthly || [];
    const thisYear = data?.response?.data?.yearly || [];
    const routeSummary = data?.response?.data?.routeSummary?.routes || [];
    const today = data?.response?.data?.today || { totalNetAmount: 0 };

    // Get chart data based on selected view
    const getChartData = useMemo(() => {
        switch (chartView) {
            case 'daily':
                console.log('=== DASHBOARD DEBUG START ===');
                console.log('lastWeek data:', lastWeek);
                console.log('thisWeek data:', thisWeek);
                
                // Combine last week and this week data
                const combinedWeekData = [...lastWeek, ...thisWeek];
                console.log('Combined data length:', combinedWeekData.length);
                console.log('Combined data:', combinedWeekData);
                
                // Remove duplicates by date - use date string as key
                const uniqueDataMap = new Map();
                combinedWeekData.forEach(item => {
                    // Extract just the date part (YYYY-MM-DD)
                    const dateKey = item.date.split('T')[0];
                    
                    if (!uniqueDataMap.has(dateKey)) {
                        uniqueDataMap.set(dateKey, item);
                    } else {
                        // If duplicate exists, sum the values
                        const existing = uniqueDataMap.get(dateKey);
                        uniqueDataMap.set(dateKey, {
                            ...existing,
                            totalNetAmount: (existing.totalNetAmount || 0) + (item.totalNetAmount || 0),
                            totalCost: (existing.totalCost || 0) + (item.totalCost || 0),
                            totalDiscount: (existing.totalDiscount || 0) + (item.totalDiscount || 0)
                        });
                    }
                });
                
                const uniqueData = Array.from(uniqueDataMap.values());
                console.log('After deduplication:', uniqueData.length, uniqueData);
                
                // Get today's date at midnight for comparison
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Calculate the date 6 days ago (so with today = 7 days total)
                const sixDaysAgo = new Date(today);
                sixDaysAgo.setDate(today.getDate() - 6);
                
                console.log('Date range:', sixDaysAgo.toISOString(), 'to', today.toISOString());
                
                // Filter data to only include last 7 days (6 days ago through today)
                const last7DaysData = uniqueData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    const isInRange = itemDate >= sixDaysAgo && itemDate <= today;
                    console.log('Date check:', item.date, 'in range:', isInRange);
                    return isInRange;
                });
                
                console.log('After date filter:', last7DaysData.length, last7DaysData);
                
                // Sort by date to ensure proper ordering
                const sortedData = last7DaysData.sort((a, b) => 
                    new Date(a.date) - new Date(b.date)
                );
                
                console.log('After sorting:', sortedData);
                
                // Map to final format with labels
                const finalData = sortedData.map((item) => {
                    const date = new Date(item.date);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    
                    return {
                        label: `${dayName}, ${monthDay}`,
                        revenue: item.totalNetAmount ?? 0,
                        dateKey: item.date.split('T')[0]  // Keep for debugging
                    };
                });
                
                console.log('Final data before slice:', finalData);
                
                // Take only first 7 items
                const result = finalData.slice(0, 7);
                console.log('=== FINAL RESULT ===', result);
                console.log('=== DASHBOARD DEBUG END ===');
                
                return result;
            case 'monthly':
                return thisMonth.map((item) => {
                    // Convert "2026-07" to "Jul"
                    const monthName = item.month ? new Date(item.month + '-01').toLocaleString('en-US', { month: 'short' }) : item.month;
                    return {
                        label: monthName || item.date,
                        revenue: item.totalNetAmount ?? 0  // Convert null to 0
                    };
                });
            case 'yearly':
                return thisYear.map((item) => ({
                    label: item.year || item.date,
                    revenue: item.totalNetAmount ?? 0  // Convert null to 0
                }));
            default:
                return [];
        }
    }, [chartView, lastWeek, thisWeek, thisMonth, thisYear]);

    const dailyRevenueData = getChartData;

    // Get chart title based on view
    const getChartTitle = () => {
        switch (chartView) {
            case 'daily':
                return 'Daily Revenue - Last 7 Days';
            case 'monthly':
                return 'Monthly Revenue for This Year';
            case 'yearly':
                return 'Yearly Revenue';
            default:
                return 'Revenue';
        }
    };

    // Pie chart expects: [{ route: 'RouteName', percentage: 35, color: '#...' }, ...]
    const totalNet = routeSummary.reduce((sum, r) => sum + (r.totalNetAmount || 0), 0);
    const routeData = routeSummary
        .map((route, idx) => ({
            route: route.routeName || `Route ${route.routeId}`,
            percentage: totalNet ? Math.round((route.totalNetAmount / totalNet) * 100) : 0,
            color: pieColors[idx % pieColors.length],
            index: idx + 1  // Add index starting from 1
        }));

    // Today's revenue
    const todayRevenue = today.totalCost || 0;

    if (loading) return <div className="flex justify-center items-center h-96"><span>Loading dashboard...</span></div>;
    if (error || data?.response?.error) {
        console.error('Dashboard error:', error || data?.response?.error);
        return <div className="flex justify-center items-center h-96 text-red-500">Failed to load dashboard data.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Main Column */}
                <div className="flex flex-col gap-4">

                    {/* First Row - Contains Logo + Today's Revenue and Sales Percent */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Left Column - Logo + Today's Revenue */}
                        <div className="flex flex-col gap-4 h-full">
                            {/* Logo */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 flex-1 group">
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                                            <img
                                                src="/logo.png"
                                                alt="MyBus logo"
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        </div>
                                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                                            MyBus
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue, Discount, Net Amount Row */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Today's Revenue */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 flex-1 group relative overflow-hidden min-w-[180px]">
                                    <div className="text-center h-full flex flex-col justify-center">
                                        <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">Today Revenue</h2>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1 group-hover:scale-105 transition-transform duration-300">
                                            ₱{todayRevenue.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">PHP Revenue</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                                    </div>
                                </div>
                                {/* Today's Discount */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 flex-1 group relative overflow-hidden min-w-[180px]">
                                    <div className="text-center h-full flex flex-col justify-center">
                                        <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">Today Discount</h2>
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-105 transition-transform duration-300">
                                            ₱{(today.totalDiscount || 0).toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">PHP Discount</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                                    </div>
                                </div>
                                {/* Today's Net Amount */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 flex-1 group relative overflow-hidden min-w-[180px]">
                                    <div className="text-center h-full flex flex-col justify-center">
                                        <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">Today Net Amount</h2>
                                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-105 transition-transform duration-300">
                                            ₱{(today.totalNetAmount || 0).toLocaleString()}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">PHP Net</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sales Percentage */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 h-full relative overflow-hidden">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 text-center">
                                Sales
                            </h3>
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4 text-sm font-medium">
                                Sales Percentage Per Route
                            </p>

                            {/* Pie Chart */}
                            <div className="h-64 mb-4 relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700/20 rounded-lg -z-10"></div>
                                {routeData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={routeData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={70}
                                                dataKey="percentage"
                                                label={({
                                                    cx,
                                                    cy,
                                                    midAngle,
                                                    outerRadius,
                                                    route,
                                                    fill,
                                                    percentage
                                                }) => {
                                                    // Don't show label if percentage is less than 5%
                                                    if (percentage < 5) return null;
                                                    
                                                    const RADIAN = Math.PI / 180;
                                                    const radius = outerRadius + 35;
                                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                    
                                                    return (
                                                        <text
                                                            x={x}
                                                            y={y}
                                                            fill={fill}
                                                            textAnchor={x > cx ? 'start' : 'end'}
                                                            dominantBaseline="central"
                                                            className="text-sm font-bold"
                                                        >
                                                            {route}
                                                        </text>
                                                    );
                                                }}
                                                labelLine={(props) => {
                                                    // Don't show label line if percentage is less than 5%
                                                    if (props.percentage < 5) return null;
                                                    return (
                                                        <path
                                                            d={`M ${props.points[0].x},${props.points[0].y} L ${props.points[1].x},${props.points[1].y}`}
                                                            stroke={isDark ? '#6b7280' : '#9CA3AF'}
                                                            strokeWidth={1.5}
                                                            fill="none"
                                                        />
                                                    );
                                                }}
                                            >
                                                {routeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value, name, props) => {
                                                    const routeName = props.payload.route || name;
                                                    return [`${value}%`, routeName];
                                                }}
                                                contentStyle={{
                                                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                                    border: isDark ? '2px solid #3b82f6' : '2px solid #3b82f6',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    padding: '12px 16px'
                                                }}
                                                labelStyle={{
                                                    color: isDark ? '#ffffff' : '#0f172a',
                                                    fontWeight: '700'
                                                }}
                                                itemStyle={{
                                                    color: isDark ? '#ffffff' : '#0f172a',
                                                    fontWeight: '700'
                                                }}
                                                wrapperStyle={{ zIndex: 100 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-gray-400 dark:text-gray-500 text-center w-full">No route data available</div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-2">
                                {routeData.length > 0 ? (
                                    routeData.map((route, index) => (
                                        <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/30 hover:shadow-md transition-all duration-300 group">
                                            <div
                                                className="w-3 h-3 rounded-full mx-auto mb-1 shadow-sm group-hover:scale-110 transition-transform duration-300"
                                                style={{ backgroundColor: route.color }}
                                            ></div>
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                                {route.route}
                                            </div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                {route.percentage}%
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center text-gray-400 dark:text-gray-500 py-4">No route data available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Second Row - Revenue Chart with Dropdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        {/* Header with Title and Dropdown */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white text-center sm:text-left">
                                {getChartTitle()} (PHP)
                            </h3>
                            
                            {/* Dropdown for view selection */}
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    View:
                                </label>
                                <select
                                    value={chartView}
                                    onChange={(e) => setChartView(e.target.value)}
                                    className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                                >
                                    <option value="daily">Daily (Last 7 Days)</option>
                                    <option value="monthly">Monthly (This Year)</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                        </div>

                        <div className="h-48 relative">
                            <div className="absolute inset-0 bg-gray-50 dark:bg-gray-700/20 rounded-lg -z-10"></div>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dailyRevenueData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-gray-600" opacity={0.6} />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: '500' }}
                                        axisLine={{ stroke: '#CBD5E1' }}
                                        className="dark:stroke-gray-600"
                                    />
                                    <YAxis
                                        domain={[0, Math.max(...dailyRevenueData.map(d => d.revenue || 0), 8)]}
                                        tick={{ fill: '#64748B', fontSize: 11, fontWeight: '500' }}
                                        axisLine={{ stroke: '#CBD5E1' }}
                                        className="dark:stroke-gray-600"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#0f172a' : '#ffffff',
                                            border: isDark ? '2px solid #3b82f6' : '2px solid #3b82f6',
                                            borderRadius: '8px',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            padding: '12px 16px'
                                        }}
                                        labelStyle={{
                                            color: isDark ? '#ffffff' : '#0f172a',
                                            fontWeight: '700'
                                        }}
                                        itemStyle={{
                                            color: isDark ? '#ffffff' : '#0f172a',
                                            fontWeight: '700'
                                        }}
                                        wrapperStyle={{ zIndex: 100 }}
                                        formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', r: 4 }}
                                        activeDot={{ r: 6, fill: '#2563EB' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
