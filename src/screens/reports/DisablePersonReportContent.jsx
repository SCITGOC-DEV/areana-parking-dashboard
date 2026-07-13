import { useEffect, useState } from "react";
import { DateButton } from "./AnexBReportContent";
import ExcelGenerator from "../../utils/ExcelGenerator";
import { TabContent } from "../home/ReportScreen";
import { useLazyQuery } from "@apollo/client";
import parkingSession from "../../graphql/queries/parkingSession";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import DateUtils from "../../utils/DateUtils";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import machine from "../../graphql/queries/machine";
import { formatDateToMMDDYYYY, formatDateToISO, formatDateWithTimezone, formatTimeWithTimezone } from "../../utils/Constants";

export const DisablePersonReportContent = () => {
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
                    created_at: paidAt,
                    boarded_at: paidAt,
                    passenger_type: session.passenger_type || 'PWD',
                    ticket_id: session.ticket_no || 'N/A',
                    registered_name: session.passenger_name || 'N/A',
                    passenger_id_no: 'N/A',
                    tin: 'N/A',
                    card_no: 'N/A',
                    boarded: true,
                    ticket_cost: gross,
                    discount: discPercent,
                    net_amount: parseFloat(session.net_amount || 0),
                    ticket_code: 'N/A',
                    validator_id: null,
                    note: null
                };
            });
            setData(mappedData);
            setLoading(false);
        }, 400);
    };

    const [getDisablePersonReportData] = useLazyQuery(parkingSession.GET_PARKING_SESSIONS_FOR_PWD_WITH_MACHINE, {
        fetchPolicy: 'network-only',
        onCompleted: handleCompleted,
        onError: (error) => {
            console.error('Error fetching PWD parking data:', error);
            setLoading(false);
        }
    });

    const [getDisablePersonReportDataWithoutMachine] = useLazyQuery(parkingSession.GET_PARKING_SESSIONS_FOR_PWD_WITHOUT_MACHINE, {
        fetchPolicy: 'network-only',
        onCompleted: handleCompleted,
        onError: (error) => {
            console.error('Error fetching PWD parking data (no machine):', error);
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
    }, [getMachines]);

    useEffect(() => {
        setLoading(true);
        setData([]);

        const { startDate: startDateStr, endDate: endDateStr } = formatDateToISO(startDate, endDate);

        const variables = {
            startDate: startDateStr,
            endDate: endDateStr,
        };

        console.log('DisablePersonReport parking sessions query variables:', variables);

        if (selectedMachine && selectedMachine.serial_number !== "All") {
            variables.saleMachineId = selectedMachine.machineId || selectedMachine.id;
            getDisablePersonReportData({
                variables: variables
            });
        } else {
            getDisablePersonReportDataWithoutMachine({
                variables: variables
            });
        }
    }, [startDate, endDate, selectedMachine, getDisablePersonReportData, getDisablePersonReportDataWithoutMachine]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const columns = [
        {
            key: 'date',
            header: 'Date & Time',
            render: (item) => {
                const dateStr = formatDateWithTimezone(item.created_at);
                const timeStr = formatTimeWithTimezone(item.created_at);
                return `${dateStr} ${timeStr}`;
            },
        },
        {
            key: 'name',
            header: 'Name',
            render: (item) => (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.registered_name || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            ),
        },
        {
            key: 'id',
            header: 'ID',
            render: (item) => (
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">
                    {item.passenger_id_no || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            ),
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
                    {item.card_no || <span className="text-gray-400 dark:text-gray-500 italic">N/A</span>}
                </span>
            ),
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
            key: 'or_number',
            header: 'OR Number',
            render: (item) => (
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {item.ticket_id}
                </span>
            ),
        },
        {
            key: 'vatable_sales',
            header: 'Vatable Sales',
            render: (item) => (
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.vatable_sales)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'vat_amount',
            header: 'VAT Amount',
            render: (item) => (
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {formatCurrency(item.vat_amount)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'vat_exempt_sales',
            header: 'VAT Exempt Sales',
            render: (item) => (
                <span className="font-semibold text-purple-600 dark:text-purple-400">
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
            key: 'remarks',
            header: 'Remarks',
            render: (item) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.note || <span className="italic text-gray-400 dark:text-gray-500">-</span>}
                </span>
            ),
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
    const totalVatableSales = data.reduce((sum, item) => sum + (parseFloat(item.vatable_sales) || 0), 0);
    const totalVatAmount = data.reduce((sum, item) => sum + (parseFloat(item.vat_amount) || 0), 0);
    const totalVatExemptSales = data.reduce((sum, item) => sum + (parseFloat(item.ticket_cost) || 0), 0);
    const totalDiscount = data.reduce((sum, item) => sum + (item.ticket_cost * (item.discount / 100) || 0), 0);
    const totalNetSales = data.reduce((sum, item) => sum + (parseFloat(item.net_amount) || 0), 0);

    return (
        <div className="space-y-6">
            <TabContent
                onExport={async () => {
                    try {
                        const result = await ExcelGenerator.exportDisablePersonReport(
                            data || [],
                            `PWD_Report_${DateUtils.fileDate(startDate)}_to_${DateUtils.fileDate(endDate)}_${selectedMachine?.serial_number || 'All'}`,
                            DateUtils.fileDate(startDate),
                            DateUtils.fileDate(endDate),
                            selectedMachine?.serial_number || 'All'
                        );

                        if (!result.success) {
                            alert('Export failed: ' + result.message);
                        }
                    } catch (error) {
                        console.error('Export error:', error);
                        alert('Export failed: ' + error.message);
                    }
                }}
                title="PWD Report"
            >
                <div className="space-y-6">
                    {/* Date Filter Section */}
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select date range and machine for your Person with Disability report
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <DateButton
                                    onChange={setStartDate}
                                    selectedDate={startDate}
                                    title="Start Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                                />
                                <DateButton
                                    onChange={setEndDate}
                                    selectedDate={endDate}
                                    title="End Date"
                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.length}</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vatable Sales</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalVatableSales)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            VAT: {formatCurrency(totalVatAmount)}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">VAT Exempt Sales</p>
                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalVatExemptSales)}</p>
                                        {totalDiscount > 0 && (
                                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                                Discounts: -{formatCurrency(totalDiscount)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Sales</p>
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalNetSales)}</p>
                                    </div>
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Record Count */}
                    {!loading && (
                        <div className="mb-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {data.length}
                                </span> record{data.length !== 1 ? 's' : ''} found
                            </div>
                            {data.length > 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Date Range: {formatDateToMMDDYYYY(startDate)} - {formatDateToMMDDYYYY(endDate)}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Data Table Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader />
                                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading disable person report data...</span>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-lg font-medium">No person with disability records found</p>
                                <p className="text-sm">No PWD transactions found for the selected date range</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Person With Disability Transaction Details
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({data.length} records)
                                        </span>
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <div className="min-w-full">
                                        <DataTable
                                            columns={columns}
                                            data={data}
                                            enablePagination={true}
                                            className="border-0 min-w-[1200px]"
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