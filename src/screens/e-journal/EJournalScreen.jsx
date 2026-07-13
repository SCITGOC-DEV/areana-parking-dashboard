import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { DataTable } from '../../common/DataTable';
import { useToast } from '../../context/ToastProvider';
import { DateButton } from '../reports/AnexBReportContent';
import { formatDateToISO } from '../../utils/Constants';
import { REPORT_BASE_URL } from '../../api/NetworkConstants';
import { SearchableDropdown } from '../../components/SearchableDropdown';
import machine from '../../graphql/queries/machine';

const PHILIPPINE_TZ = 'Asia/Manila';
const DOWNLOAD_E_JOURNAL_REPORT = `${REPORT_BASE_URL}/download-exported-e-journal-report-by-admin`;

// Helper function to format date in Philippine timezone
const formatPhilippineDate = (date, formatStr) => {
    if (!date) return 'N/A';
    const zonedDate = toZonedTime(new Date(date), PHILIPPINE_TZ);
    return format(zonedDate, formatStr);
};

const GET_E_JOURNALS = gql`
query GetEJournals($startDate: timestamptz!, $endDate: timestamptz!, $machineId: Int, $machineType: String) {
  e_journals(
    where: {
      report_date_time: {_gte: $startDate, _lte: $endDate}
      _and: [
        {machine_id: {_eq: $machineId}}
        {machine: {type: {_eq: $machineType}}}
      ]
    }
    order_by: {created_at: desc}
  ) {
    id
    report_date_time
    exported_file_name
    exported_folder_path
    reported_date_from
    reported_date_to
    remark
    created_at
    machine_id
  }
}
`;

const GET_E_JOURNALS_ALL = gql`
query GetEJournalsAll($startDate: timestamptz!, $endDate: timestamptz!) {
  e_journals(
    where: {
      report_date_time: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    id
    report_date_time
    exported_file_name
    exported_folder_path
    reported_date_from
    reported_date_to
    remark
    created_at
    machine_id
  }
}
`;

export const EJournalScreen = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [eJournals, setEJournals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const { addToast } = useToast();

    const [getEJournals] = useLazyQuery(GET_E_JOURNALS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data?.e_journals) {
                setEJournals(data.e_journals);
            }
            setLoading(false);
        },
        onError: (error) => {
            console.error('Error fetching e-journals:', error);
            setLoading(false);
        }
    });

    const [getEJournalsAll] = useLazyQuery(GET_E_JOURNALS_ALL, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (data?.e_journals) {
                setEJournals(data.e_journals);
            }
            setLoading(false);
        },
        onError: (error) => {
            console.error('Error fetching e-journals (all):', error);
            setLoading(false);
        }
    });

    const [getMachines] = useLazyQuery(machine.GET_ALL_MACHINES, {
        onCompleted: (data) => {
            if (data.response && Array.isArray(data.response)) {
                const options = [
                    { id: "machine-all", label: "All", serial_number: "All" },
                    ...data.response.map((m, idx) => ({
                        id: `machine-${m.id}-${idx}`,
                        label: m.serial_number,
                        serial_number: m.serial_number,
                        machineId: m.id,
                        ...m
                    }))
                ];
                setMachineSerialNumbers(options);
                setSelectedMachine(options[0]); // Set "All" as default
            }
        },
        onError: (error) => {
            console.error('Error fetching machines:', error);
        }
    });

    useEffect(() => {
        getMachines();
    }, []);

    useEffect(() => {
        setLoading(true);
        setEJournals([]);

        const { startDate: startDateStr, endDate: endDateStr } = formatDateToISO(selectedDate, selectedDate);

        const variables = {
            startDate: startDateStr,
            endDate: endDateStr,
        };

        console.log('EJournal query variables:', variables);

        if (selectedMachine && selectedMachine.serial_number !== "All") {
            variables.machineId = selectedMachine.machineId || selectedMachine.id;
            variables.machineType = selectedMachine.type;
            getEJournals({
                variables: variables
            });
        } else {
            getEJournalsAll({
                variables: {
                    startDate: startDateStr,
                    endDate: endDateStr
                }
            });
        }
    }, [selectedDate, selectedMachine]);

    const handleDownload = async (eJournal) => {
        try {
            const response = await fetch(DOWNLOAD_E_JOURNAL_REPORT, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "eJournalId": eJournal.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                addToast(error.message || "Download failed", "error");
                return;
            }

            if(response?.error === 1) {
                addToast(response.message,"error");
                return;
            }

            const blob = await response.blob();
            // Use exported_file_name from the e-journal data
            let fileName = eJournal.exported_file_name || `e_journal_${eJournal.id}.txt`;

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            addToast("Download completed successfully", "success");
        } catch (error) {
            addToast("Download failed: " + error.message, "error");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const columns = [
        {
            key: 'id',
            header: 'Journal ID',
            render: (item) => `#${item.id}`,
            className: 'font-medium'
        },
        {
            key: 'report_date_time',
            header: 'Report Date Time',
            render: (item) => formatPhilippineDate(item.report_date_time, 'MMM dd, yyyy hh:mm:ss a')
        },
        {
            key: 'reported_date_to',
            header: 'Date',
            render: (item) => formatPhilippineDate(item.reported_date_to, 'MMM dd, yyyy')
        },
        {
            key: 'machine',
            header: 'Machine',
            render: (item) => (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.machine?.serial_number || 'N/A'}
                </span>
            )
        },
        {
            key: 'machine_type',
            header: 'Machine Type',
            render: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {item.machine?.type || 'N/A'}
                </span>
            )
        },
        {
            key: 'remark',
            header: 'Remark',
            render: (item) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.remark || '-'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item) => {
                const downloadable = item.exported_file_name ? true : false;
                return (
                    <button
                        onClick={() => {
                            if (downloadable) handleDownload(item);
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
                                E-Journal Records
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Comprehensive view of all e-journal records with download capabilities
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
                                Select date and machine serial number for your e-journal records
                            </p>
                        </div>

                        {/* All Filters in One Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DateButton
                                onChange={setSelectedDate}
                                selectedDate={selectedDate}
                                title="Select Date"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                aria-label="Select date for E-Journal records"
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
                                {eJournals.length}
                            </span> record{eJournals.length !== 1 ? 's' : ''} found
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
                        data={eJournals}
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
