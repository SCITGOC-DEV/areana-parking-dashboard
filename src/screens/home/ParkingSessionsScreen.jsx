import { useState, useEffect, useRef } from "react";
import { useLazyQuery } from "@apollo/client";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import { ToastType, useToast } from "../../context/ToastProvider";
import parkingSession from "../../graphql/queries/parkingSession";
import { formatDateToMMDDYYYY } from "../../utils/Constants";

const formatPHTime = (utc) => {
    if (!utc) return 'N/A';
    // Ensure UTC is parsed correctly by appending Z if missing
    const normalized = utc.endsWith('Z') || utc.includes('+') ? utc : `${utc}Z`;
    return new Date(normalized).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
};

export const ParkingSessionsScreen = () => {
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [activeSuggestionField, setActiveSuggestionField] = useState(null);
    const { addToast } = useToast();
    const suggestionRefs = useRef({});

    const [filters, setFilters] = useState({
        ticketNo: '',
        passenger: '',
        plateNumber: '',
        vehicle: '',
        status: '',
        paymentStatus: '',
        paymentMethod: '',
        parkedBy: '',
        retrievedBy: '',
    });

    const [suggestions, setSuggestions] = useState({
        ticketNo: [],
        passenger: [],
        plateNumber: [],
        vehicle: [],
        status: [],
        paymentStatus: [],
        paymentMethod: [],
        parkedBy: [],
        retrievedBy: [],
    });

    const [loadSessions] = useLazyQuery(parkingSession.GET_PARKING_SESSIONS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setLoading(false);
            const list = data.parking_sessions || [];
            setSessions(list);
            setFilteredSessions(list);
            setSuggestions({
                ticketNo: [...new Set(list.map(s => s.ticket_no).filter(Boolean))],
                passenger: [...new Set(list.map(s => s.passenger_name).filter(Boolean))],
                plateNumber: [...new Set(list.map(s => s.plate_number).filter(Boolean))],
                vehicle: [...new Set(list.map(s => [s.car_brand, s.car_model, s.car_color].filter(Boolean).join(' ')).filter(Boolean))],
                status: [...new Set(list.map(s => s.status).filter(Boolean))],
                paymentStatus: [...new Set(list.map(s => s.payment_status).filter(Boolean))],
                paymentMethod: [...new Set(list.map(s => s.payment_method).filter(Boolean))],
                parkedBy: [...new Set(list.map(s => s.parked_valet_driver?.name).filter(Boolean))],
                retrievedBy: [...new Set(list.map(s => s.retrieved_valet_driver?.name).filter(Boolean))],
            });
        },
        onError: (err) => {
            setLoading(false);
            addToast(err.message, ToastType.Error);
        }
    });

    useEffect(() => {
        setLoading(true);
        loadSessions();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filters, sessions]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e) => {
            const isInsideSuggestion = Object.values(suggestionRefs.current).some(ref => ref?.contains(e.target));
            if (!isInsideSuggestion) setActiveSuggestionField(null);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const applyFilters = () => {
        let result = [...sessions];
        const f = filters;
        if (f.ticketNo) result = result.filter(s => s.ticket_no?.toLowerCase().includes(f.ticketNo.toLowerCase()));
        if (f.passenger) result = result.filter(s => s.passenger_name?.toLowerCase().includes(f.passenger.toLowerCase()));
        if (f.plateNumber) result = result.filter(s => s.plate_number?.toLowerCase().includes(f.plateNumber.toLowerCase()));
        if (f.vehicle) result = result.filter(s => [s.car_brand, s.car_model, s.car_color].join(' ').toLowerCase().includes(f.vehicle.toLowerCase()));
        if (f.status) result = result.filter(s => s.status?.toLowerCase().includes(f.status.toLowerCase()));
        if (f.paymentStatus) result = result.filter(s => s.payment_status?.toLowerCase().includes(f.paymentStatus.toLowerCase()));
        if (f.paymentMethod) result = result.filter(s => s.payment_method?.toLowerCase().includes(f.paymentMethod.toLowerCase()));
        if (f.parkedBy) result = result.filter(s => s.parked_valet_driver?.name?.toLowerCase().includes(f.parkedBy.toLowerCase()));
        if (f.retrievedBy) result = result.filter(s => s.retrieved_valet_driver?.name?.toLowerCase().includes(f.retrievedBy.toLowerCase()));
        setFilteredSessions(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setActiveSuggestionField(name);
    };

    const handleSuggestionClick = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setActiveSuggestionField(null);
    };

    const resetFilters = () => {
        setFilters({ ticketNo: '', passenger: '', plateNumber: '', vehicle: '', status: '', paymentStatus: '', paymentMethod: '', parkedBy: '', retrievedBy: '' });
        setActiveSuggestionField(null);
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const FilterInput = ({ name, placeholder }) => {
        const filtered = suggestions[name]?.filter(s => s.toLowerCase().includes(filters[name].toLowerCase()) && s.toLowerCase() !== filters[name].toLowerCase()) || [];
        return (
            <div className="relative" ref={el => suggestionRefs.current[name] = el}>
                <input
                    type="text"
                    name={name}
                    value={filters[name]}
                    onChange={handleFilterChange}
                    onFocus={() => setActiveSuggestionField(name)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {activeSuggestionField === name && filtered.length > 0 && (
                    <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filtered.slice(0, 8).map((s, i) => (
                            <li
                                key={i}
                                onMouseDown={() => handleSuggestionClick(name, s)}
                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const statusBadge = (value) => {
        const colorMap = {
            'PENDING': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
            'ACCEPT_FOR_PARKING': 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
            'PARKED': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
            'REQUEST_FOR_RETRIEVAL': 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
            'RETRIEVING': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            'COMPLETED': 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || 'bg-gray-50 text-gray-500'}`}>
                {value || 'N/A'}
            </span>
        );
    };

    const columns = [
        { key: 'ticket_no', header: 'TICKET NO', render: (item) => <span className="font-mono text-sm">{item.ticket_no || 'N/A'}</span> },
        { key: 'passenger_name', header: 'PASSENGER', render: (item) => item.passenger_name || 'N/A' },
        { key: 'plate_number', header: 'PLATE NO', render: (item) => item.plate_number || 'N/A' },
        { key: 'vehicle', header: 'VEHICLE', render: (item) => [item.car_brand, item.car_model, item.car_color].filter(Boolean).join(' ') || 'N/A', hideOnMobile: true },
        { key: 'status', header: 'STATUS', render: (item) => statusBadge(item.status) },
        { key: 'payment_status', header: 'PAYMENT', render: (item) => statusBadge(item.payment_status) },
        { key: 'payment_method', header: 'METHOD', render: (item) => item.payment_method || 'N/A', hideOnMobile: true },
        { key: 'total_amount', header: 'TOTAL', render: (item) => item.total_amount != null ? `₱${parseFloat(item.total_amount).toFixed(2)}` : 'N/A' },
        { key: 'parked_by', header: 'PARKED BY', render: (item) => item.parked_valet_driver?.name || 'N/A', hideOnMobile: true },
        { key: 'retrieved_by', header: 'RETRIEVED BY', render: (item) => item.retrieved_valet_driver?.name || 'N/A', hideOnMobile: true },
        { key: 'parking_location', header: 'LOCATION', render: (item) => item.parking_location?.name || 'N/A', hideOnMobile: true },
        { key: 'checkin_time', header: 'CHECK IN', render: (item) => formatPHTime(item.checkin_time), hideOnMobile: true },
        { key: 'checkout_time', header: 'CHECK OUT', render: (item) => formatPHTime(item.checkout_time), hideOnMobile: true },
    ];

    if (loading) return <Loader />;

    return (
        <div className="p-4 sm:p-6 w-full flex flex-col items-center">
            <div className="w-full max-w-7xl">

                {/* Filters */}
                <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <FilterInput name="ticketNo" placeholder="Ticket No" />
                        <FilterInput name="passenger" placeholder="Passenger" />
                        <FilterInput name="plateNumber" placeholder="Plate No" />
                        <FilterInput name="vehicle" placeholder="Vehicle" />
                        <div className="relative">
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="PENDING">PENDING</option>
                                <option value="ACCEPT_FOR_PARKING">ACCEPT_FOR_PARKING</option>
                                <option value="PARKED">PARKED</option>
                                <option value="REQUEST_FOR_RETRIEVAL">REQUEST_FOR_RETRIEVAL</option>
                                <option value="RETRIEVING">RETRIEVING</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>
                        <FilterInput name="paymentStatus" placeholder="Payment Status" />
                        <FilterInput name="paymentMethod" placeholder="Payment Method" />
                        <FilterInput name="parkedBy" placeholder="Parked By" />
                        <FilterInput name="retrievedBy" placeholder="Retrieved By" />
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Showing {filteredSessions.length} of {sessions.length} sessions
                        </p>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setSelectedSession(null)}>
                        <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-[var(--color-secondary-light)]">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Session Details</h2>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Ticket #{selectedSession.ticket_no || 'N/A'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {statusBadge(selectedSession.status)}
                                    <button onClick={() => setSelectedSession(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors">✕</button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Passenger Info */}
                                <div>
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Passenger</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Name', selectedSession.passenger_name],
                                            ['Phone', selectedSession.passenger_phone],
                                            ['Email', selectedSession.passenger_email],
                                            ['Type', selectedSession.passenger_type],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Vehicle Info */}
                                <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Vehicle</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Plate No', selectedSession.plate_number],
                                            ['Brand', selectedSession.car_brand],
                                            ['Model', selectedSession.car_model],
                                            ['Color', selectedSession.car_color],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Timing */}
                                <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Timing</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Check In', formatPHTime(selectedSession.checkin_time)],
                                            ['Check Out', formatPHTime(selectedSession.checkout_time)],
                                            ['Total Hours', (() => {
                                                if (selectedSession.total_hours != null) return `${selectedSession.total_hours} hrs`;
                                                // if (selectedSession.checkin_time) {
                                                //     const start = new Date(selectedSession.checkin_time.endsWith('Z') ? selectedSession.checkin_time : `${selectedSession.checkin_time}Z`);
                                                //     const end = selectedSession.checkout_time
                                                //         ? new Date(selectedSession.checkout_time.endsWith('Z') ? selectedSession.checkout_time : `${selectedSession.checkout_time}Z`)
                                                //         : new Date();
                                                //     const hrs = ((end - start) / 3600000).toFixed(2);
                                                //     return `${hrs} hrs${!selectedSession.checkout_time ? ' (ongoing)' : ''}`;
                                                // }
                                                return 'N/A';
                                            })()],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment */}
                                <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Payment</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-[var(--color-text-secondary)]">Status</p>
                                            <div className="mt-0.5">{statusBadge(selectedSession.payment_status)}</div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-[var(--color-text-secondary)]">Method</p>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{selectedSession.payment_method || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-[var(--color-bg-secondary)] rounded-xl p-4 grid grid-cols-2 gap-3">
                                        {[
                                            ['Base Fee', selectedSession.base_fee],
                                            ['Hourly Rate', selectedSession.hourly_rate],
                                            ['Discount', selectedSession.discount],
                                            ['Total Amount', selectedSession.total_amount],
                                            ['Net Amount', selectedSession.net_amount],
                                            ['Paid Amount', selectedSession.paid_amount],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex justify-between items-center">
                                                <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
                                                <span className={`text-sm font-semibold ${label === 'Total Amount' || label === 'Net Amount' ? 'text-green-600 dark:text-green-400' : 'text-[var(--color-text-primary)]'}`}>
                                                    {value != null ? `₱${parseFloat(value).toFixed(2)}` : 'N/A'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Valet Drivers */}
                                <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Valet Drivers</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
                                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Parked By</p>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedSession.parked_valet_driver?.name || 'N/A'}</p>
                                            {selectedSession.parked_valet_driver?.phone && (
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{selectedSession.parked_valet_driver.phone}</p>
                                            )}
                                        </div>
                                        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
                                            <p className="text-xs text-[var(--color-text-secondary)] mb-1">Retrieved By</p>
                                            <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedSession.retrieved_valet_driver?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Parking Location */}
                                {selectedSession.parking_location && (
                                    <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                        <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Parking Location</h3>
                                        <div className="bg-[var(--color-bg-secondary)] rounded-xl p-4">
                                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{selectedSession.parking_location.name}</p>
                                            {selectedSession.parking_location.address && (
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">{selectedSession.parking_location.address}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <DataTable
                    title="Parking Sessions"
                    columns={columns}
                    data={filteredSessions}
                    onRowClick={setSelectedSession}
                    enablePagination
                    emptyMessage="No parking sessions found"
                />
            </div>
        </div>
    );
};
