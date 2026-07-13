import {TabContent} from "../home/ReportScreen";
import {DropdownButton} from "./AnexBReportContent";
import {Loader} from "../../components/Loader";
import React, {useEffect, useState} from "react";
import {ToastType, useToast} from "../../context/ToastProvider";
import {useLazyQuery, useMutation} from "@apollo/client";
import report from "../../graphql/queries/report";
import {AlertCircle, Calendar, CheckCircle, Clock, CreditCard, DollarSign, FileText, XCircle} from 'lucide-react';
import RouteQueries from "../../graphql/queries/RouteQueries";
import TextFileDownloader from "../../utils/TextFileDownloader";
import { formatDateToMMDDYYYY, formatTIN } from "../../utils/Constants";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return formatDateToMMDDYYYY(dateTime);
};

export const XReadingContent = () => {
    const [loading, setLoading] = useState(false);
    const {addToast} = useToast();
    const [reportData, setData] = useState(null);
    const [vehicleRoutes, setVehicleRoutes] = useState([]);
    const [selectedVehicleRoute, setSelectedVehicleRoute] = useState(null);

    const [getVehicleRoutes] = useLazyQuery(RouteQueries.GET_VEHICLE_ROUTE, {
        onCompleted: (data) => {
            if (data.response.length > 0) {
                setVehicleRoutes(data.response);
                setSelectedVehicleRoute(data.response[0]);
            }
        }
    })

    const [getXReadingReport] = useMutation(report.GET_X_READING_REPORT, {
        onCompleted: (data) => {
            setLoading(false);
            if (data.response.error === 0) {
                setData(data.response)
            } else {
                addToast(data.response.message, ToastType.Error);
            }
        },
        onError: (error) => {
            setLoading(false);
            addToast(error.message, ToastType.Error)
        }
    })

    useEffect(() => {
        getVehicleRoutes();
    }, []);

    useEffect(() => {
        if (selectedVehicleRoute !== null) {
            getXReadingReport({
                    variables: {
                        vehicleRouteId: selectedVehicleRoute?.id
                    }
                }
            )
        }
    }, [selectedVehicleRoute]);

    const handleSelectVehicle = (vehicleRoute) => {
        setSelectedVehicleRoute(vehicleRoute);
        console.log('selected vehicle route', vehicleRoute);
    }

    const StatCard = ({title, value, icon: Icon, className = "", prefix = ""}) => (
        <div
            className={`p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)] w-full ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">{title}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">{prefix}{value}</p>
                </div>
                <div className="bg-[var(--color-primary)] p-3 rounded-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                </div>
            </div>
        </div>
    );

    if (reportData?.error) {
        return (
            <div className="min-h-screen bg-[var(--color-bg-secondary)] flex items-center justify-center p-4">
                <div
                    className="bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)] p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Error Loading Report</h2>
                    <p className="text-[var(--color-text-secondary)]">{reportData?.error}</p>
                </div>
            </div>
        );
    }

    const data = reportData?.data;

    return (
        <div>
            <TabContent
                title="X Reading Report"
                onExport={() => TextFileDownloader.downloadXReadingReportTxt(data)}>
                <div className="relative">
                    <div className="flex gap-4 my-4">
                        <DropdownButton
                            title={`${selectedVehicleRoute?.direction} ${selectedVehicleRoute?.vehicle.vehicle_plate_number}`}
                            label="Vehicle Route"
                            options={vehicleRoutes}
                            displayField={["direction", "vehicle.vehicle_plate_number", "route.route_info"]}
                            onSelect={handleSelectVehicle}
                        />
                    </div>
                    {loading ? (
                        <Loader/>
                    ) : (
                        <div className="w-full bg-[var(--color-bg-primary)]">
                            <div className=" mx-auto">
                                {/* Header */}
                                <div
                                    className="p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)] mb-6">
                                    <div className="text-center">
                                        <h1 className="text-2xl sm:text-4xl font-bold text-[var(--color-primary)] mb-2">
                                            {data?.headerTitle}
                                        </h1>
                                        <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-4">{data?.headerSubTitle}</p>
                                        <div
                                            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-[var(--color-text-secondary)]">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2"/>
                                                {data?.reportDate}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2"/>
                                                {data?.reportTime}
                                            </div>
                                            <div className="flex items-center">
                                                <FileText className="w-4 h-4 mr-2"/>
                                                {data?.sn}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                                    <StatCard
                                        title="Total Payment"
                                        value={formatCurrency(data?.totalPayment)}
                                        icon={DollarSign}
                                    />
                                    <StatCard
                                        title="Opening Balance"
                                        value={formatCurrency(data?.openingBalance)}
                                        icon={CreditCard}
                                    />
                                    <StatCard
                                        title="Closing Balance"
                                        value={formatCurrency(data?.closingBalance)}
                                        icon={CreditCard}
                                    />
                                    <StatCard
                                        title="Short/Over"
                                        value={formatCurrency(Math.abs(data?.shortOver))}
                                        icon={AlertCircle}
                                        prefix={data?.shortOver >= 0 ? '+' : '-'}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                    {/* Payment Methods */}
                                    <div className="lg:col-span-2">
                                        <div
                                            className="p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)]">
                                            <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center">
                                                <CreditCard
                                                    className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-[var(--color-primary)]"/>
                                                Payment Methods
                                            </h3>
                                            <div className="space-y-4">
                                                {data?.paymentMethod.map((payment, index) => {
                                                    const percentage = (payment.amount / data?.totalPayment) * 100;
                                                    return (
                                                        <div key={index}
                                                             className="p-4 sm:p-6 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-secondary-light)]">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span
                                                                    className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">{payment.paymentType}</span>
                                                                <span
                                                                    className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(payment.amount)}</span>
                                                            </div>
                                                            <div
                                                                className="w-full bg-[var(--color-secondary-light)] rounded-full h-2 sm:h-3">
                                                                <div
                                                                    className="bg-[var(--color-primary)] h-2 sm:h-3 rounded-full transition-all duration-1000"
                                                                    style={{width: `${percentage}%`}}
                                                                ></div>
                                                            </div>
                                                            <p className="text-sm text-[var(--color-text-secondary)] mt-2">{percentage.toFixed(1)}%
                                                                of total</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    <div className="space-y-6">
                                        <div
                                            className="p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)]">
                                            <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-6">Transaction
                                                Details</h3>
                                            <div className="space-y-4">
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span
                                                        className="text-[var(--color-text-secondary)]">Beginning OR</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{data?.beginningOr}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span
                                                        className="text-[var(--color-text-secondary)]">Ending OR</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{data?.endingOr}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span className="text-[var(--color-text-secondary)]">Void Transactions</span>
                                                    <span className="font-semibold text-red-600">{data?.void}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span className="text-[var(--color-text-secondary)]">Refunds</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(data?.refund)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3">
                                                    <span
                                                        className="text-[var(--color-text-secondary)]">Withdrawals</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(data?.withdrawal)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className="p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)]">
                                            <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-6">System
                                                Information</h3>
                                            <div className="space-y-4">
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span className="text-[var(--color-text-secondary)]">Accreditation No.</span>
                                                    <span
                                                        className="font-semibold text-sm text-[var(--color-text-primary)]">{data?.accreditationNo}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span className="text-[var(--color-text-secondary)]">PTU No.</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{data?.ptuNo}</span>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center py-3 border-b border-[var(--color-secondary-light)]">
                                                    <span className="text-[var(--color-text-secondary)]">VAT TIN</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{formatTIN(data?.vatTin)}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-3">
                                                    <span
                                                        className="text-[var(--color-text-secondary)]">Valid Until</span>
                                                    <span
                                                        className="font-semibold text-[var(--color-text-primary)]">{data?.validUntil}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Operation Period */}
                                <div
                                    className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)]">
                                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] mb-6">Operation
                                        Period</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <div
                                            className="p-4 sm:p-6 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-secondary-light)]">
                                            <h4 className="text-base sm:text-lg font-semibold text-[var(--color-primary)] mb-2">Start
                                                Time</h4>
                                            <p className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">{formatDateTime(data?.startDateTime)}</p>
                                        </div>
                                        <div
                                            className="p-4 sm:p-6 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-secondary-light)]">
                                            <h4 className="text-base sm:text-lg font-semibold text-[var(--color-primary)] mb-2">End
                                                Time</h4>
                                            <p className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">{formatDateTime(data?.endDateTime)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div
                                    className="mt-6 sm:mt-8 p-4 sm:p-6 bg-[var(--color-bg-primary)] rounded-lg border border-[var(--color-secondary-light)] text-center">
                                    <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)] mb-2">{data?.footerTitle}</h3>
                                    <p className="text-[var(--color-text-secondary)] mb-4">{data?.footerSubTitle}</p>
                                    <div className="flex justify-center items-center">
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mr-2"/>
                                        <span className="text-green-600 font-semibold">{reportData?.message}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </TabContent>
        </div>
    )
}
