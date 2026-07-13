import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import TicketQueries from "../../graphql/queries/TicketQueries";
import { ToastType, useToast } from "../../context/ToastProvider";
import { Loader } from "../../components/Loader";
import { DataTable } from "../../common/DataTable";
import { formatDateToMMDDYYYY, formatDateToYYYYMMDD } from "../../utils/Constants";
import { DateButton, getOneMonthEarlier } from "./AnexBReportContent";
import { TabContent } from "../home/ReportScreen";
import dateUtils from "../../utils/DateUtils";
import ExcelGenerator from "../../utils/ExcelGenerator";

const generateTicketId = (machineId, ticketId) => {
    const paddedMachineId = String(machineId).padStart(2, '0');
    const paddedTicketId = String(ticketId).padStart(8, '0');
    return paddedMachineId + paddedTicketId;
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount || 0);

export const SaleTicketReportContent = () => {
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const { addToast } = useToast();

    const [loadTickets] = useLazyQuery(TicketQueries.GET_SALE_TICKETS, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setTimeout(() => {
                setLoading(false);
                setFilteredTickets(data.response);
            }, 400);
        },
        onError: (err) => {
            setLoading(false);
            addToast(err.message, ToastType.Error);
        },
    });

    useEffect(() => {
        setLoading(true);
        const startDateStr = formatDateToYYYYMMDD(startDate);
        const endDateStr = formatDateToYYYYMMDD(endDate);
        
        const phDateFrom = new Date(`${startDateStr}T00:00:00Z`);
        const utcStart = new Date(phDateFrom.getTime() - (8 * 60 * 60 * 1000));
        
        const phDateTo = new Date(`${endDateStr}T00:00:00Z`);
        const utcEnd = new Date(phDateTo.getTime() + (24 * 60 * 60 * 1000) - (8 * 60 * 60 * 1000) - 1000);
        
        loadTickets({
            variables: {
                startDate: utcStart.toISOString(),
                endDate: utcEnd.toISOString()
            }
        });
    }, [startDate, endDate]);

    const totalSummary = filteredTickets.reduce(
        (acc, t) => {
            acc.grossSales += t.ticket_cost || 0;
            acc.discount += (t.ticket_cost || 0) * ((t.discount || 0) / 100);
            acc.netSales += t.net_amount || 0;
            return acc;
        },
        { grossSales: 0, discount: 0, netSales: 0 }
    );

    const columns = [
        {
            key: 'created_at',
            header: 'Transaction Date',
            render: (item) => (
                <span className="text-gray-800 dark:text-gray-200">
                    {formatDateToMMDDYYYY(item.created_at)}
                </span>
            ),
        },
        {
            key: 'passenger_type',
            header: 'Passenger Type',
            render: (item) => (
                <span className="capitalize text-gray-700 dark:text-gray-300">
                    {item.passenger_type || 'N/A'}
                </span>
            ),
        },
        {
            key: 'ticket_id',
            header: 'Ticket ID',
            render: (item) => (
                <span className="capitalize text-gray-700 dark:text-gray-300">
                    {item.ticket_code || 'N/A'}
                </span>
            ),
        },
        {
            key: 'invoice_no',
            header: 'Invoice No.',
            render: (item) => {
                if (item.machine_id == null || item.ticket_id == null) {
                    return (
                        <div className="flex flex-col space-y-1">
                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                                N/A
                            </span>
                            <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>Machine: N/A</span>
                                <span>Ticket: N/A</span>
                            </div>
                        </div>
                    );
                }
                const fullTicketId = generateTicketId(item.machine_id, item.ticket_id);
                return (
                    <div className="flex flex-col space-y-1">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                            {fullTicketId}
                        </span>
                        <div className="flex space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Machine: {String(item.machine_id).padStart(2, '0')}</span>
                            <span>Ticket: {String(item.ticket_id).padStart(8, '0')}</span>
                        </div>
                    </div>
                );
            },
            sortable: true,
            width: '200px',
            className: 'min-w-0',
        },
        {
            key: 'ticket_type',
            header: 'Ticket Type',
            render: (item) => (
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {item.staff_id ? 'POS' : item.passenger_id ? 'Mobile' : 'Paper'}
                </span>
            ),
        },
        {
            key: 'registered_name',
            header: 'Name',
            render: (item) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {item.registered_name || 'Anonymous'}
                </span>
            ),
        },
        {
            key: 'registered_phone',
            header: 'Mobile Number',
            render: (item) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {item.registered_phone || 'N/A'}
                </span>
            ),
        },
        {
            key: 'used',
            header: 'Used',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.boarded ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {item.boarded ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            key: 'ticket_cost',
            header: 'Gross Sales (CAD)',
            render: (item) => (
                <span className="font-mono text-blue-700 dark:text-blue-300">
                    {formatCurrency(item.ticket_cost)}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'discount',
            header: 'Discount (CAD)',
            render: (item) => (
                <span className="font-mono text-purple-700 dark:text-purple-300">
                    {formatCurrency((item.ticket_cost ?? 0) * ((item.discount ?? 0) / 100))}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'net_amount',
            header: 'Net Sales (CAD)',
            render: (item) => (
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.net_amount)}
                </span>
            ),
            className: 'text-right',
        },
    ];

    if (loading) return <Loader />;

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <TabContent
                onExport={() => ExcelGenerator.exportSaleTicketsReport(
                    filteredTickets,
                    dateUtils.fileDate(startDate),
                    dateUtils.fileDate(endDate)
                )}
                title="Sale Tickets Report"
                className="bg-white dark:bg-gray-900"
            >
                {/* Filter Card */}
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Report Filters</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Select a date range to filter sale ticket transactions</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                            <DateButton title="Start Date" selectedDate={startDate} onChange={setStartDate} />
                            <DateButton title="End Date" selectedDate={endDate} onChange={setEndDate} />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {filteredTickets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{filteredTickets.length}</p>
                                </div>
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gross Sales</p>
                                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalSummary.grossSales)}</p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Discount</p>
                                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalSummary.discount)}</p>
                                </div>
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Sales</p>
                                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSummary.netSales)}</p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredTickets}
                        className="border-none"
                        enablePagination={true}
                    />
                </div>
            </TabContent>
        </div>
    );
};
