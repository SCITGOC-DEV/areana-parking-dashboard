import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import { ToastType, useToast } from "../../context/ToastProvider";
import parkingQueries from "../../graphql/queries/parking";
import { formatDateToISO, formatDateWithTimezone, formatTimeWithTimezone } from "../../utils/Constants";
import { DateButton } from "../reports/AnexBReportContent";
import ExcelGenerator from "../../utils/ExcelGenerator";

const formatPHTime = (utc) => {
    if (!utc) return 'N/A';
    const dateStr = formatDateWithTimezone(utc);
    const timeStr = formatTimeWithTimezone(utc);
    return dateStr && timeStr ? `${dateStr} ${timeStr}` : 'N/A';
};

export const ParkingsScreen = () => {
    const [parkings, setParkings] = useState([]);
    const [filteredParkings, setFilteredParkings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedParking, setSelectedParking] = useState(null);
    const { addToast } = useToast();

    const [filters, setFilters] = useState({
        ticketNo: '',
        plateNumber: '',
    });

    const [loadParkings] = useLazyQuery(parkingQueries.GET_PARKINGS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setLoading(false);
            const list = data.parkings || [];
            setParkings(list);
            setFilteredParkings(list);
        },
        onError: (err) => {
            setLoading(false);
            addToast(err.message, ToastType.Error);
        }
    });

    useEffect(() => {
        setLoading(true);
        const { startDate: startISO, endDate: endISO } = formatDateToISO(startDate, endDate);
        loadParkings({
            variables: {
                startDate: startISO,
                endDate: endISO,
            }
        });
    }, [startDate, endDate, loadParkings]);

    useEffect(() => {
        applyFilters();
    }, [filters, parkings]);

    const applyFilters = () => {
        let result = [...parkings];
        const f = filters;
        if (f.ticketNo) {
            result = result.filter(p => p.ticket_no?.toLowerCase().includes(f.ticketNo.toLowerCase()));
        }
        if (f.plateNumber) {
            result = result.filter(p => p.plate_number?.toLowerCase().includes(f.plateNumber.toLowerCase()));
        }
        setFilteredParkings(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ ticketNo: '', plateNumber: '' });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== '');

    const handleExportExcel = () => {
        ExcelGenerator.exportParkingsReport(filteredParkings, startDate, endDate, filters);
    };

    const columns = [
        { key: 'ticket_no', header: 'TICKET NO', render: (item) => <span className="font-mono text-sm font-semibold">{item.ticket_no || 'N/A'}</span> },
        { key: 'plate_number', header: 'PLATE NO', render: (item) => <span className="font-semibold">{item.plate_number || 'N/A'}</span> },
        { key: 'check_in_time', header: 'CHECK IN', render: (item) => formatPHTime(item.check_in_time) },
        { key: 'check_out_time', header: 'CHECK OUT', render: (item) => formatPHTime(item.check_out_time) },
        { key: 'check_in_machine_id', header: 'CHECK IN MACHINE', render: (item) => item.check_in_machine_id || 'N/A', hideOnMobile: true },
        { key: 'check_out_machine_id', header: 'CHECK OUT MACHINE', render: (item) => item.check_out_machine_id || 'N/A', hideOnMobile: true },
        { key: 'vehicle_type_id', header: 'VEHICLE TYPE', render: (item) => item.vehicle_type_id || 'N/A', hideOnMobile: true },
    ];

    return (
        <div className="p-4 sm:p-6 w-full flex flex-col items-center">
            <div className="w-full max-w-7xl">

                {/* Toolbar containing date selection & text filters */}
                <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">

                        <div>
                            <DateButton
                                title="Start Date"
                                selectedDate={startDate}
                                onChange={setStartDate}
                            />
                        </div>

                        <div>
                            <DateButton
                                title="End Date"
                                selectedDate={endDate}
                                onChange={setEndDate}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Ticket No
                            </label>
                            <input
                                type="text"
                                name="ticketNo"
                                value={filters.ticketNo}
                                onChange={handleFilterChange}
                                placeholder="Ticket No..."
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Search Plate No
                            </label>
                            <input
                                type="text"
                                name="plateNumber"
                                value={filters.plateNumber}
                                onChange={handleFilterChange}
                                placeholder="Plate Number..."
                                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="flex gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            Showing {filteredParkings.length} of {parkings.length} parkings
                        </p>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedParking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setSelectedParking(null)}>
                        <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-[var(--color-secondary-light)]">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Parking Details</h2>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">ID #{selectedParking.id}</p>
                                </div>
                                <button onClick={() => setSelectedParking(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors">✕</button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Ticket Info */}
                                <div>
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">General Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Ticket No', selectedParking.ticket_no],
                                            ['Plate Number', selectedParking.plate_number],
                                            ['Vehicle Type ID', selectedParking.vehicle_type_id],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Machine Info */}
                                <div className="border-t border-[var(--color-secondary-light)] pt-4">
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Machines</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Check-In Machine ID', selectedParking.check_in_machine_id],
                                            ['Check-Out Machine ID', selectedParking.check_out_machine_id],
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
                                    <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Timestamps (Manila Time)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            ['Check In Time', formatPHTime(selectedParking.check_in_time)],
                                            ['Check Out Time', formatPHTime(selectedParking.check_out_time)],
                                            ['Created At', formatPHTime(selectedParking.created_at)],
                                        ].map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
                                                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{value || 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader />
                    </div>
                ) : (
                    <DataTable
                        title="Parkings"
                        columns={columns}
                        data={filteredParkings}
                        onRowClick={setSelectedParking}
                        enablePagination
                        emptyMessage="No parking records found for this date"
                        actions={[
                            {
                                label: "Export Excel",
                                onClick: handleExportExcel,
                                disabled: filteredParkings.length === 0,
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                )
                            }
                        ]}
                    />
                )}
            </div>
        </div>
    );
};
