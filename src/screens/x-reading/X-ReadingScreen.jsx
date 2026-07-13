import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { FiDownload } from "react-icons/fi";
import xReading from "../../graphql/queries/xReading";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import { formatDateToMMDDYYYY, formatDateToYYYYMMDD } from "../../utils/Constants";
import { DateButton } from "../reports/AnexBReportContent";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import machine from "../../graphql/queries/machine";
import { useToast } from "../../context/ToastProvider";
import { DOWNLOAD_X_READING_REPORT } from "../../api/NetworkConstants";

export const XReadingScreen = () => {
    const { addToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const columns = [
        {
            key: "id",
            header: "Report ID",
            render: (item) => `#${item.id || 'N/A'}`,
            className: 'font-medium'
        },
        {
            key: "machine_id",
            header: "Machine Serial Number",
            render: (item) => selectedMachine?.serial_number || item.machine_id || 'N/A'
        },
        {
            key: "valet_driver_id",
            header: "Valet Driver ID",
            render: (item) => item.valet_driver_id || 'N/A'
        },
        {
            key: "opening_balance",
            header: "Opening Balance",
            render: (item) => formatCurrency(item.opening_balance)
        },
        {
            key: "closing_balance",
            header: "Closing Balance",
            render: (item) => formatCurrency(item.closing_balance)
        },
        {
            key: "start_time",
            header: "Start Date Time",
            render: (item) => {
                if (!item.start_time) return 'N/A';
                return formatDateToMMDDYYYY(item.start_time);
            }
        },
        {
            key: "end_time",
            header: "End Date Time",
            render: (item) => {
                if (!item.end_time) return 'N/A';
                return formatDateToMMDDYYYY(item.end_time);
            }
        },
        {
            key: "transaction_date",
            header: "Transaction Date",
            render: (item) => {
                if (!item.transaction_date) return 'N/A';
                return formatDateToMMDDYYYY(item.transaction_date);
            }
        },
        {
            key: "created_at",
            header: "Created At",
            render: (item) => {
                if (!item.created_at) return 'N/A';
                return formatDateToMMDDYYYY(item.created_at);
            }
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) => (
                <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <FiDownload className="mr-1.5" />
                    Download
                </button>
            )
        }
    ];

    const [getXReadingReport] = useLazyQuery(xReading.GET_X_READING_REPORT_BY_MACHINE, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setLoading(false);
            if (data && Array.isArray(data.response)) {
                setData(data.response);
            } else {
                setData([]);
                addToast('No data found for the selected filters', 'info');
            }
        },
        onError: (error) => {
            setLoading(false);
            setData([]);
            const errorMsg = error.message || 'An error occurred while fetching the report';
            addToast(errorMsg, 'error');
        }
    });

    const [getXReadingReportAll] = useLazyQuery(xReading.GET_X_READING_REPORT_BY_MACHINE_ALL, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setLoading(false);
            if (data && Array.isArray(data.response)) {
                setData(data.response);
            } else {
                setData([]);
                addToast('No data found for the selected filters', 'info');
            }
        },
        onError: (error) => {
            setLoading(false);
            setData([]);
            const errorMsg = error.message || 'An error occurred while fetching the report';
            addToast(errorMsg, 'error');
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
                setSelectedMachine(options[0] || null); // Set first machine as default (which is "All")
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

        setLoading(true);
        setData([]);

        const dateStr = formatDateToYYYYMMDD(selectedDate);

        if (selectedMachine.serial_number !== "All") {
            const machineId = selectedMachine?.machineId || selectedMachine?.id;
            getXReadingReport({
                variables: {
                    reportDate: dateStr,
                    machineId: machineId
                }
            });
        } else {
            getXReadingReportAll({
                variables: {
                    reportDate: dateStr
                }
            });
        }
    }, [selectedDate, selectedMachine, getXReadingReport, getXReadingReportAll]);

    const handleDownload = async (item) => {
        try {
            const response = await fetch(DOWNLOAD_X_READING_REPORT, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    machineId: item.machine_id || selectedMachine?.machineId || selectedMachine?.id || 1,
                    reportDate: formatDateToYYYYMMDD(selectedDate),
                    reportId: item.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                addToast(error.message || "Download failed", 'error');
                return;
            }

            const blob = await response.blob();
            
            // Determine machine identifier for filename
            let machineIdentifier = "unknown";
            if (item.machine_id) {
                machineIdentifier = selectedMachine?.serial_number !== "All" ? selectedMachine.serial_number : `id_${item.machine_id}`;
            } else if (selectedMachine?.serial_number) {
                machineIdentifier = selectedMachine.serial_number;
            }
            
            let fileName = `x_reading_report_${machineIdentifier}_${formatDateToYYYYMMDD(selectedDate)}.txt`;

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);

            addToast("Download completed successfully", 'success');
        } catch (error) {
            addToast("Download failed: " + error.message, 'error');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                X Reading Reports
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Comprehensive view of all X reading reports with machine details
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
                                Select date and machine serial number for your X reading reports
                            </p>
                        </div>

                        {/* All Filters in One Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <DateButton
                                onChange={setSelectedDate}
                                selectedDate={selectedDate}
                                title="Select Date"
                                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                aria-label="Select date for X reports"
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
                                {data.length}
                            </span> record{data.length !== 1 ? 's' : ''} found
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
                        data={data}
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
