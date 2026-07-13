import React, { useEffect, useState } from "react";
import { DateButton } from "./AnexBReportContent";
import ExcelGenerator from "../../utils/ExcelGenerator";
import { TabContent } from "../home/ReportScreen";
import { useLazyQuery } from "@apollo/client";
import parkingSession from "../../graphql/queries/parkingSession";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import DateUtils from "../../utils/DateUtils";
import machine from "../../graphql/queries/machine";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import { formatDateToMMDDYYYY, formatDateToISO, formatDateWithTimezone } from "../../utils/Constants";
import { updateHasuraRole } from "../../api/apolloClient";

export const AnexAReportContent = () => {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [machineSerialNumbers, setMachineSerialNumbers] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);

    const handleCompleted = (data) => {
        setTimeout(() => {
            const responseData = data.response || [];
            const mappedData = responseData.map(session => {
                const gross = parseFloat(session.total_amount || 0);
                const discAmount = parseFloat(session.discount || 0);
                const discPercent = gross > 0 ? (discAmount / gross) * 100 : 0;
                const paidAt = session.paid_at || session.created_at;

                return {
                    ...session,
                    created_at: formatDateWithTimezone(paidAt),
                    boarded_at: formatDateWithTimezone(paidAt),
                    passenger_type: session.passenger_type || 'Regular',
                    ticket_id: session.ticket_no || 'N/A',
                    registered_name: session.passenger_name || 'N/A',
                    passenger_id_no: 'N/A',
                    tin: 'N/A',
                    card_no: 'N/A',
                    boarded: true,
                    ticket_cost: gross,
                    discount: discPercent,
                    net_amount: parseFloat(session.net_amount || 0),
                    ticket_code: 'N/A'
                };
            });
            setData(mappedData);
            setLoading(false);
        }, 400);
    };

    const [getParkingReportData] = useLazyQuery(parkingSession.GET_PARKING_SESSIONS_REPORT_WITH_MACHINE, {
        fetchPolicy: 'network-only',
        onCompleted: handleCompleted,
        onError: (error) => {
            console.error('Error fetching parking report data:', error);
            setLoading(false);
        }
    });

    const [getParkingReportDataWithoutMachine] = useLazyQuery(parkingSession.GET_PARKING_SESSIONS_REPORT_WITHOUT_MACHINE, {
        fetchPolicy: 'network-only',
        onCompleted: handleCompleted,
        onError: (error) => {
            console.error('Error fetching parking report data (no machine):', error);
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
        updateHasuraRole("super_admin");
        getMachines();
    }, [getMachines]);

    useEffect(() => {
        updateHasuraRole("sale_report");
        setLoading(true);
        setData([]);

        const { startDate: startDateStr, endDate: endDateStr } = formatDateToISO(startDate, endDate);

        const variables = {
            startDate: startDateStr,
            endDate: endDateStr,
        };

        console.log('AnexA parking sessions query variables:', variables);

        if (selectedMachine && selectedMachine.serial_number !== "All") {
            variables.saleMachineId = selectedMachine.machineId || selectedMachine.id;
            getParkingReportData({
                variables: variables
            });
        } else {
            getParkingReportDataWithoutMachine({
                variables: variables
            });
        }
    }, [startDate, endDate, selectedMachine, getParkingReportData, getParkingReportDataWithoutMachine]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const columns = [
        {
            key: 'transaction_date',
            header: 'Transaction Date',
            render: (item) => formatDateWithTimezone(item.created_at),
        },
        {
            key: 'ticket_type',
            header: 'Ticket Type',
            render: (item) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    REGULAR
                </span>
            )
        },
        {
            key: 'receipt_no',
            header: 'Invoice No.',
            render: (item) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {item.ticket_id}
                </span>
            )
        },
        {
            key: 'name',
            header: 'Name',
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.registered_name || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            )
        },
        {
            key: 'id',
            header: 'ID Number',
            render: (item) => (
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {item.passenger_id_no || 'N/A'}
                </span>
            ),
            className: 'min-w-32'
        },
        {
            key: 'tin',
            header: 'TIN',
            render: (item) => (
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {item.tin || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            ),
        },
        {
            key: 'card_no',
            header: 'Card No',
            render: (item) => (
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {item?.card_no || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            )
        },
        {
            key: 'salemachineId',
            header: 'Sale Machine ID',
            render: (item) => (
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {item.machine_id || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            ),
            className: 'min-w-32'
        },
        {
            key: 'boarded',
            header: 'Boarded',
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.boarded
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                    {item.boarded ? 'N/A' : 'N/A'}
                </span>
            )
        },
        {
            key: 'gross_sales',
            header: 'Gross Sales',
            render: (item) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.ticket_cost)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'discount',
            header: 'Discount',
            render: (item) => (
                <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatCurrency(item.ticket_cost * (item.discount / 100))}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'net_sales',
            header: 'Net Sales',
            render: (item) => (
                <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(item.net_amount)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'ticket_code',
            header: 'Ticket Code',
            render: (item) => (
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
                    {item.ticket_code || 'N/A'}
                </span>
            ),
            className: 'min-w-32'
        },
    ];

    // Calculate summary statistics
    const totalGrossSales = data.reduce((sum, item) => sum + (item.ticket_cost || 0), 0);
    const totalDiscount = data.reduce((sum, item) => sum + (item.ticket_cost * (item.discount / 100) || 0), 0);
    const totalNetSales = data.reduce((sum, item) => sum + (item.net_amount || 0), 0);

    return (
        <div className="space-y-6 w-full">
            <TabContent
                onExport={() => ExcelGenerator.exportAnexAReport(
                    data,
                    `Sales_${DateUtils.fileDate(startDate)}_to_${DateUtils.fileDate(endDate)}_${selectedMachine?.serial_number || 'All'}`,
                    DateUtils.fileDate(startDate),
                    DateUtils.fileDate(endDate),
                    'All',
                    selectedMachine?.serial_number || 'All'
                )}
                title="Sales Report"
            >
                <div className="space-y-6 w-full max-w-full">
                    {/* Date Filter Section */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select date range and machine serial number for your sales report
                                </p>
                            </div>

                            {/* All Filters in One Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DateButton
                                    onChange={setStartDate}
                                    selectedDate={startDate}
                                    title="Start Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                    aria-label="Select start date for report"
                                />
                                <DateButton
                                    onChange={setEndDate}
                                    selectedDate={endDate}
                                    title="End Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                    aria-label="Select end date for report"
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

                    {/* Summary Cards */}
                    {!loading && data.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Sales</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalGrossSales)}</p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Sales</p>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalNetSales)}</p>
                                        {totalDiscount > 0 && (
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                Discounts: -{formatCurrency(totalDiscount)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Table Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading transaction data...</span>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-lg font-medium">No transactions found</p>
                                <p className="text-sm">Try adjusting your date range to see more results</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Transaction Details
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({data.length} records)
                                        </span>
                                    </h3>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Date Range: <span className="font-semibold">{formatDateToMMDDYYYY(startDate)} - {formatDateToMMDDYYYY(endDate)}</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <DataTable
                                            columns={columns}
                                            data={data}
                                            enablePagination={true}
                                            className="border border-gray-200 dark:border-gray-600 min-w-[800px]"
                                            tableClassName="border-collapse"
                                            headerClassName="border-b border-gray-200 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-800 z-10"
                                            rowClassName="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 even:bg-gray-50 even:dark:bg-gray-800/50"
                                            cellClassName="border-r border-gray-100 dark:border-gray-700 last:border-r-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TabContent>
        </div>
    );
};