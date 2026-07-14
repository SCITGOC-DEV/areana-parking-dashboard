import React, { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { gql, useQuery } from "@apollo/client";
import { useToast } from "../../../context/ToastProvider";
import { useAuth } from "../../../context/AuthContext";
import { useTheme } from "../../../context/ThemeContext";

const GET_VEHICLE_COUNTS = gql`
  query GetParkingVehicleCounts {
    response: parkingGetVehicleCountsByAdmin {
      success
      message
      data {
        parked {
          carCount
          motorcycleCount
          otherCount
          totalCount
        }
        completed {
          carCount
          motorcycleCount
          otherCount
          totalCount
        }
      }
    }
  }
`;

// Beautiful SVG Icons for categories
const CarIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 16V17C19 18.1046 18.1046 19 17 19H7C5.89543 19 5 18.1046 5 17V16M19 16C20.1046 16 21 15.1046 21 14V11C21 9.89543 20.1046 9 19 9H5C3.89543 9 3 9.89543 3 11V14C3 15.1046 3.89543 16 5 16M19 16H5M6 9L8 4H16L18 9M9 14H9.01M15 14H15.01" />
    </svg>
);

const MotorcycleIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="6" cy="18" r="3" strokeWidth={2} />
        <circle cx="18" cy="18" r="3" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18h12M9 18l3-6 2-3h4M12 12h4M6 15l2-6h2" />
    </svg>
);

const OtherIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TotalIcon = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const DashboardScreen = () => {
    const { addToast } = useToast();
    const { logout } = useAuth();
    const { isDark } = useTheme();
    const { data, loading, error } = useQuery(GET_VEHICLE_COUNTS, {
        fetchPolicy: "network-only"
    });

    // Check for authorization/error message
    useEffect(() => {
        const msg = data?.response?.message;
        if (data?.response && !data.response.success) {
            addToast(msg || 'Failed to fetch dashboard counts.', 'error');
            if (msg && (msg.includes('403') || msg.includes('Permission denied'))) {
                setTimeout(() => {
                    if (window.confirm('Session expired or permissions changed. Logout now?')) {
                        logout();
                    }
                }, 2000);
            }
        }
    }, [data, addToast, logout]);

    const stats = useMemo(() => {
        const defaultBreakdown = { carCount: 0, motorcycleCount: 0, otherCount: 0, totalCount: 0 };
        return data?.response?.data || { parked: defaultBreakdown, completed: defaultBreakdown };
    }, [data]);

    const chartData = useMemo(() => {
        return [
            {
                name: 'Cars',
                Parked: stats.parked.carCount || 0,
                Completed: stats.completed.carCount || 0,
            },
            {
                name: 'Bikes',
                Parked: stats.parked.motorcycleCount || 0,
                Completed: stats.completed.motorcycleCount || 0,
            },
            {
                name: 'Others',
                Parked: stats.parked.otherCount || 0,
                Completed: stats.completed.otherCount || 0,
            }
        ];
    }, [stats]);

    const activeDistribution = useMemo(() => {
        return [
            { name: 'Cars', value: stats.parked.carCount || 0, color: '#3B82F6' },
            { name: 'Motorcycles', value: stats.parked.motorcycleCount || 0, color: '#10B981' },
            { name: 'Others', value: stats.parked.otherCount || 0, color: '#8B5CF6' }
        ].filter(d => d.value > 0);
    }, [stats]);

    const completedDistribution = useMemo(() => {
        return [
            { name: 'Cars', value: stats.completed.carCount || 0, color: '#3B82F6' },
            { name: 'Motorcycles', value: stats.completed.motorcycleCount || 0, color: '#10B981' },
            { name: 'Others', value: stats.completed.otherCount || 0, color: '#8B5CF6' }
        ].filter(d => d.value > 0);
    }, [stats]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading vehicle counts...</span>
            </div>
        );
    }

    if (error || (data?.response && !data.response.success)) {
        return (
            <div className="flex flex-col justify-center items-center h-96 text-red-500 p-6">
                <svg className="w-16 h-16 mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-semibold text-lg">Dashboard Error</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 max-w-md">
                    {error?.message || data?.response?.message || "Failed to load parking metrics."}
                </span>
            </div>
        );
    }

    const StatCard = ({ title, value, icon, breakdown, type }) => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-450 uppercase tracking-wider">{title}</h3>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1 group-hover:scale-105 transition-transform duration-300">
                        {value}
                    </p>
                </div>
                <div className={`p-3.5 rounded-2xl ${type === 'parked' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                    {icon}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-50 dark:border-gray-700/50 pt-4">
                {[
                    { label: 'Cars', val: breakdown.carCount, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/20', icon: <CarIcon className="w-4 h-4 mx-auto mb-1 text-blue-500" /> },
                    { label: 'Bikes', val: breakdown.motorcycleCount, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', icon: <MotorcycleIcon className="w-4 h-4 mx-auto mb-1 text-emerald-500" /> },
                    { label: 'Others', val: breakdown.otherCount, color: 'text-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-950/20', icon: <OtherIcon className="w-4 h-4 mx-auto mb-1 text-purple-500" /> }
                ].map((item, idx) => (
                    <div key={idx} className={`p-2 rounded-xl text-center ${item.bg}`}>
                        {item.icon}
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">{item.label}</p>
                        <p className={`text-base font-bold mt-0.5 ${item.color}`}>{item.val || 0}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="w-full py-4 sm:py-6 flex flex-col gap-6">

            {/* Header section */}
            <div className="flex flex-col md:flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Parking Overview</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time status of parked vehicles and completed parking sessions.</p>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Active Parked Vehicles"
                    value={stats.parked.totalCount || 0}
                    icon={<TotalIcon className="w-6 h-6" />}
                    breakdown={stats.parked}
                    type="parked"
                />
                <StatCard
                    title="Completed Sessions"
                    value={stats.completed.totalCount || 0}
                    icon={<TotalIcon className="w-6 h-6" />}
                    breakdown={stats.completed}
                    type="completed"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Grouped Bar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Category Comparison</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Comparison of parked vs completed vehicle counts.</p>
                    </div>
                    <div className="h-44 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#F1F5F9'} opacity={0.6} />
                                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: '500' }} />
                                <YAxis tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: '500' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                        border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    }}
                                    labelStyle={{ color: isDark ? '#FFFFFF' : '#1E293B', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="Parked" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-4 text-[10px] font-bold uppercase text-gray-450 dark:text-gray-400">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span>
                            <span>Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span>
                            <span>Done</span>
                        </div>
                    </div>
                </div>

                {/* Donut Distributions - Active Parked */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Active Distribution</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Percentage breakdown of active parking slots.</p>
                    </div>

                    <div className="h-44 relative flex items-center justify-center">
                        {activeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {activeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                            border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                            borderRadius: '8px',
                                        }}
                                        itemStyle={{ color: isDark ? '#FFFFFF' : '#1E293B', fontWeight: 'semibold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">No active vehicles</span>
                        )}
                        {stats.parked.totalCount > 0 && (
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.parked.totalCount}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-550">Active</span>
                            </div>
                        )}
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-1.5 mt-4">
                        {[
                            { label: 'Cars', count: stats.parked.carCount, color: 'bg-blue-500' },
                            { label: 'Bikes', count: stats.parked.motorcycleCount, color: 'bg-emerald-500' },
                            { label: 'Others', count: stats.parked.otherCount, color: 'bg-purple-500' },
                        ].map((item, index) => {
                            const pct = stats.parked.totalCount > 0 ? Math.round((item.count / stats.parked.totalCount) * 100) : 0;
                            return (
                                <div key={index} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                                    </div>
                                    <div className="text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <span>{item.count || 0}</span>
                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">({pct}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Donut Distributions - Completed Sessions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/60 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Completed Distribution</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Percentage breakdown of completed sessions.</p>
                    </div>

                    <div className="h-44 relative flex items-center justify-center">
                        {completedDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={completedDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {completedDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                                            border: `1px solid ${isDark ? '#374151' : '#E2E8F0'}`,
                                            borderRadius: '8px',
                                        }}
                                        itemStyle={{ color: isDark ? '#FFFFFF' : '#1E293B', fontWeight: 'semibold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">No completed sessions</span>
                        )}
                        {stats.completed.totalCount > 0 && (
                            <div className="absolute flex flex-col items-center">
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.completed.totalCount}</span>
                                <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-550">Done</span>
                            </div>
                        )}
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-1.5 mt-4">
                        {[
                            { label: 'Cars', count: stats.completed.carCount, color: 'bg-blue-500' },
                            { label: 'Bikes', count: stats.completed.motorcycleCount, color: 'bg-emerald-500' },
                            { label: 'Others', count: stats.completed.otherCount, color: 'bg-purple-500' },
                        ].map((item, index) => {
                            const pct = stats.completed.totalCount > 0 ? Math.round((item.count / stats.completed.totalCount) * 100) : 0;
                            return (
                                <div key={index} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                        <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                                    </div>
                                    <div className="text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <span>{item.count || 0}</span>
                                        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold">({pct}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};
