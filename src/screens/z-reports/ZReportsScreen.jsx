import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { DataTable } from '../../common/DataTable';
import { useToast } from '../../context/ToastProvider';
import { DateButton } from '../reports/AnexBReportContent';
import { formatDateToISO } from '../../utils/Constants';
import { DOWNLOAD_Z_READING_REPORT } from '../../api/NetworkConstants';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import machine from '../../graphql/queries/machine';

const PHILIPPINE_TZ = 'Asia/Manila';

// Helper function to format date in Philippine timezone
const formatPhilippineDate = (date, formatStr) => {
    if (!date) return 'N/A';
    const zonedDate = toZonedTime(new Date(date), PHILIPPINE_TZ);
    return format(zonedDate, formatStr);
};

const GET_Z_REPORTS = gql`
query MyQuery($startDate: timestamptz!, $endDate: timestamptz!, $machineId: Int, $machineType: String) {
  report_z_counter(
    where: {
      report_date_time: {_gte: $startDate, _lte: $endDate}
      _and: [
        {report: {machine_id: {_eq: $machineId}}}
        {report: {machine: {type: {_eq: $machineType}}}}
      ]
    }
    order_by: {created_at: desc}
  ) {
    admin_id
    created_at
    id
    report_date_time
    report_id
    staff_id
    z_counter
    reported_date_from
    reported_date_to
    report {
      admin_id
      created_at
      id
      machine_id
      report_count
      report_date
      report_name
      report_type
      staff_id
      vehicle_id
      machine {
        serial_number
        type
      }
    }
    exported_file_name
  }
}
`;

const getFormattedDate = (iso) => {
    const zonedDate = toZonedTime(new Date(iso), PHILIPPINE_TZ);

    const pad = (n) => String(n).padStart(2, "0");

    const hours24 = zonedDate.getHours();
    const hours12 = hours24 % 12 || 12;
    const ampm = hours24 >= 12 ? "PM" : "AM";

    const formatted =
        zonedDate.getFullYear() + "_" +
        pad(zonedDate.getMonth() + 1) + "_" +
        pad(zonedDate.getDate()) + "_" +
        pad(hours12) + "_" +
        pad(zonedDate.getMinutes()) + "_" +
        pad(zonedDate.getSeconds()) + "_" +
        ampm;

    return formatted;
}

export const ZReportsScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reports, setReports] = useState([]);
    const {addToast} = useToast();
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);

    const [getZReports, { loading, error }] = useLazyQuery(GET_Z_REPORTS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data?.report_z_counter) {
                setReports(data.report_z_counter);
            }
        }
    });

    const [getMachines] = useLazyQuery(machine.GET_ALL_MACHINES, {
        onCompleted: (data) => {
            if (data.response && Array.isArray(data.response)) {
                const options = data.response.map((m, idx) => ({
                    id: `machine-${m.id}-${idx}`,
                    label: m.serial_number,
                    serial_number: m.serial_number,
                    machineId: m.id,
                    ...m
                }));
                setMachineSerialNumbers(options);
                setSelectedMachine(options[0] || null); // Set first machine as default
            }
        },
        onError: (error) => {
            console.error('Error fetching machines:', error);
        }
    });

    useEffect(() => {
        getMachines();
    }, [getMachines]);

    useEffect(() => {
        // Skip if selectedMachine is null (initial state)
        if (!selectedMachine) {
            return;
        }

        const { startDate, endDate } = formatDateToISO(selectedDate, selectedDate);
        
        const variables = {
            startDate: startDate,
            endDate: endDate,
            machineId: selectedMachine.machineId || selectedMachine.id,
            machineType: selectedMachine.type
        };

        getZReports({
            variables: variables
        });
    }, [selectedDate, getZReports, selectedMachine]);

    const handleDownload = async (report) => {
        try {
            const response = await fetch(DOWNLOAD_Z_READING_REPORT, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "reportZCounterId": report.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.message);
                return;
            }

            if(response?.error === 1) {
                addToast(response.message,"error");
                return;
            }

            const blob = await response.blob();
            // Use exported_file_name from the report data
            let fileName = report.exported_file_name || `z_reading_report_${getFormattedDate(report.report_date_time)}.txt`;

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            console.log('download response: ', response)

        } catch (error) {

        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading Z reports: {error.message}</p>
            </div>
        );
    }

    const columns = [
        {
            key: 'report_id',
            header: 'Report ID',
            render: (item) => `#${item.report_id || item.id}`,
            className: 'font-medium'
        },
        {
            key: 'report_date',
            header: 'Report Date Time',
            render: (item) => formatPhilippineDate(item.report_date_time, 'MMM dd, yyyy hh:mm:ss a')
        },
        {
            key: 'z_counter',
            header: 'Z Counter',
            render: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.z_counter}
                </span>
            )
        },
        {
            key: 'report_count',
            header: 'Report Count',
            render: (item) => item.report?.report_count || 'N/A'
        },
        {
            key: 'staff_id',
            header: "Staff ID",
            render: (item) => item.staff_id || 'N/A'
        },
        {
            key: 'report.machine.serial_number',
            header: 'Machine Serial Number',
            render: (item) => item.report?.machine?.serial_number || 'N/A'
        },
        {
            key: 'admin_id',
            header: 'Admin ID',
            render: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.admin_id || 'N/A'}
                </span>
            )
        },
        {
            key: 'date_range',
            header: 'Date Range',
            render: (item) => (
                <div className="text-xs">
                    {item.reported_date_from && (
                        <div>From: {formatPhilippineDate(item.reported_date_from, 'MMM dd, yyyy hh:mm:ss a')}</div>
                    )}
                    {item.reported_date_to && (
                        <div>To: {formatPhilippineDate(item.reported_date_to, 'MMM dd, yyyy hh:mm:ss a')}</div>
                    )}
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Created',
            render: (item) => formatPhilippineDate(item.created_at, 'MMM dd, yyyy HH:mm')
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item) => {
                const downloadable = item.exported_file_name ? true : false;
                return (
                <button
                    onClick={() => {
                        if(downloadable) handleDownload(item);
                    }}
                    className={downloadable ? "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" : "inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"}
                >
                    <FiDownload className="mr-1.5" />
                    {downloadable ? 'Download' : 'Not Downloadable'}
                </button>
            )
            }
        }
    ];

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Z Report Histories
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Comprehensive view of all saved Z counter reports with download capabilities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                Report Filters
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Select date and machine serial number for your Z reports
                            </p>
                        </div>

                        {/* All Filters in One Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DateButton
                                onChange={setSelectedDate}
                                selectedDate={selectedDate}
                                title="Select Date"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                aria-label="Select date for Z reports"
                            />
                            <div>
                                {machineSerialNumbers?.length > 0 ? (
                                    <SearchableDropdown
                                        label="Machine Serial Number"
                                        options={machineSerialNumbers}
                                        displayField="serial_number"
                                        onChange={setSelectedMachine}
                                        value={selectedMachine}
                                        placeholder="Select machine..."
                                        aria-label="Select machine serial number"
                                    />
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Machine Serial Number
                                        </label>
                                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
                                            No machines available
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Record Count */}
                {!loading && (
                    <div className="mb-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {reports.length}
                            </span> record{reports.length !== 1 ? 's' : ''} found
                            {selectedMachine && (
                                <span className="ml-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
                                    Machine: {selectedMachine.serial_number}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <DataTable
                        data={reports}
                        columns={columns}
                        showNoColumn={true}
                        enablePagination={true}
                        itemsPerPageOptions={[10, 20, 50]}
                        defaultItemsPerPage={10}
                        noDataClassName="py-12"
                    />
                </div>
            </div>
        </div>
    );
};
