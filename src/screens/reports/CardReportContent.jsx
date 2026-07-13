import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import report from "../../graphql/mutation/report";
import { DataTable } from "../../common/DataTable";
import { Loader } from "../../components/Loader";
import { TabContent } from "../home/ReportScreen";
import { DateButton } from "./AnexBReportContent";
import { formatDateToYYYYMMDD } from "../../utils/Constants";
import ExcelGenerator from "../../utils/ExcelGenerator";
import dateUtils from "../../utils/DateUtils";

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount || 0);

export const CardReportContent = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const [generateReport] = useLazyQuery(report.REPORT_GENERATE_CARD_REPORT, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setTimeout(() => {
                setLoading(false);
                setReportData(data.reportGenerateCardReport?.data ?? null);
            }, 400);
        },
        onError: () => setLoading(false),
    });

    const fetchReport = () => {
        setLoading(true);
        generateReport({
            variables: {
                startDate: formatDateToYYYYMMDD(selectedDate),
                endDate: formatDateToYYYYMMDD(selectedDate),
                cardNo: null,
            },
        });
    };

    useEffect(() => {
        fetchReport();
    }, [selectedDate]);

    const cards = reportData?.cards ?? [];
    const grandTotal = reportData?.grandTotal;

    const columns = [
        {
            key: 'cardNo',
            header: 'Card No',
            render: (item) => (
                <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                    {item.cardNo || 'N/A'}
                </span>
            ),
        },
        {
            key: 'paymentMethod',
            header: 'Payment Method',
            render: (item) => (
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {item.paymentMethod || 'N/A'}
                </span>
            ),
        },
        {
            key: 'credit',
            header: 'Credit',
            render: (item) => (
                <span className="font-mono text-blue-700 dark:text-blue-300">
                    {formatCurrency(item.credit)}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'debit',
            header: 'Debit',
            render: (item) => (
                <span className="font-mono text-red-600 dark:text-red-400">
                    {formatCurrency(item.debit)}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'payable',
            header: 'Payable',
            render: (item) => (
                <span className="font-mono font-semibold text-green-700 dark:text-green-300">
                    {formatCurrency(item.payable)}
                </span>
            ),
            className: 'text-right',
        },
    ];

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <TabContent
                title="Card Report"
                onExport={() => ExcelGenerator.exportCardReport(
                    reportData,
                    dateUtils.fileDate(selectedDate),
                    dateUtils.fileDate(selectedDate)
                )}
            >
                {/* Filter Card */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">Report Date</span>
                        <div className="w-52">
                            <DateButton title="Select Date" selectedDate={selectedDate} onChange={setSelectedDate} />
                        </div>
                    </div>
                </div>

                {loading ? <Loader /> : (
                    <>
                        {/* Summary Cards */}
                        {grandTotal && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Credit</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal.credit)}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Debit</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(grandTotal.debit)}</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Payable</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(grandTotal.payable)}</p>
                                </div>
                            </div>
                        )}

                        {/* Report meta info */}
                        {/* {reportData && (
                            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                {reportData.period && <span>Period: <span className="font-medium text-gray-700 dark:text-gray-300">{reportData.period}</span></span>}
                                {reportData.dateGenerated && <span>Generated: <span className="font-medium text-gray-700 dark:text-gray-300">{reportData.dateGenerated} {reportData.time}</span></span>}
                            </div>
                        )} */}

                        {/* Data Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={cards}
                                className="border-none"
                                enablePagination={true}
                            />
                        </div>
                    </>
                )}
            </TabContent>
        </div>
    );
};
