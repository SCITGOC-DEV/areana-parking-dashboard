import React, { useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import RouteQueries from "../../graphql/queries/RouteQueries";
import { TabContent } from "../home/ReportScreen";
import ExcelGenerator from "../../utils/ExcelGenerator";
import { DateButton, DropdownButton } from "./AnexBReportContent";
import { Loader } from "../../components/Loader";
import { DataTable } from "../../common/DataTable";
import vehicle from "../../graphql/queries/vehicle";
import { ToastType, useToast } from "../../context/ToastProvider";
import report from "../../graphql/mutation/report";
import dayjs from "dayjs";
import dateUtils from "../../utils/DateUtils";
import machine from "../../graphql/queries/machine";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import DateUtils from "../../utils/DateUtils";
import { formatDateToMMDDYYYY, formatDateToYYYYMMDD } from "../../utils/Constants";
import {updateHasuraRole} from "../../api/apolloClient";

export const BusTripReportContent = () => {
    const [data, setData] = useState([]);
    const [date, setDate] = useState(new Date());
    const [route, setRoute] = useState(null)
    const [routes, setRoutes] = useState([]);
    const [plateNumber, setPlateNumber] = useState(null);
    const [vehiclePlateNumbers, setVehiclePlateNumbers] = useState([]);
    const [loading, setLoading] = useState(false)
    const { addToast } = useToast()

    const [getAllRoutes] = useLazyQuery(RouteQueries.GET_ALL_ROUTES, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const allRoutesOption = { id: 'all', route_name: 'All Routes' };
            const routesWithAll = [allRoutesOption, ...data.routes];
            if (routesWithAll.length > 0) setRoute(routesWithAll[0])
            setRoutes(routesWithAll)
        },
    })

    const [getPlateNumbers] = useLazyQuery(vehicle.GET_ALL_VEHICLE_PLATE_NUMBERS, {
        onCompleted: (data) => {
            console.log('data: ', data.response[0])
            const allPlateOption = { vehicle_plate_number: 'All Plate Numbers', isAll: true };
            const plateNumbersWithAll = [allPlateOption, ...data.response];
            setVehiclePlateNumbers(plateNumbersWithAll)
            if (plateNumbersWithAll.length > 0) setPlateNumber(plateNumbersWithAll[0])
        }
    })

    const [getReportData] = useMutation(vehicle.GET_BUS_TRIP_REPORT_DATA, {
        onCompleted: (data) => {
            console.log('response', data);
            const response = data.response;
            if (response.error === 1) {
                addToast(response.message, ToastType.Error)
                setData([])
            } else setData(response.vehicle_list ?? []);
            setLoading(false)
        },
        onError: (err) => {
            setLoading(false)
        }
    })

    useEffect(() => {
        if (plateNumber !== null && route !== null) {
            setLoading(true)
            const routeId = route.id === 'all' ? null : parseInt(route?.id, 10);
            const vehiclePlateNumber = plateNumber.isAll ? null : plateNumber.vehicle_plate_number;
            const variables = {
                vehiclePlateNumber: vehiclePlateNumber,
                date: formatDateToYYYYMMDD(date),
                routeId: routeId,
            }
            console.log('variables: ', variables)
            updateHasuraRole("bus_trip_report")
            getReportData({
                variables: variables
            })
        }
    }, [date, plateNumber, route]);

    useEffect(() => {
        setTimeout(() => {
            updateHasuraRole("super_admin")
            getAllRoutes()
            getPlateNumbers();
        },400)
    }, []);

    const columns = [
        {
            key: 'plate_no_out',
            header: 'PLATE NO.',
            render: (item) => item.vehicle_plate_number,
        },
        {
            key: 'dispatch_time',
            header: 'ACTUAL DISPATCH TIME',
            render: (item) =>
                new Date(item.dispatch_time).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
        },
        {
            key: 'total_pax',
            header: 'TOTAL PAX',
            render: (item) => item.bus_stop_list?.reduce((sum, stop) => sum + stop.ticket_count, 0) || 0,
        },
        {
            key: 'route_name',
            header: 'Route Name',
            render: (item) => item.routeName,

        },
        // {
        //     key: 'driver_out',
        //     header: 'DRIVER',
        //     render: (item) => item.full_name,
        // },
        {
            key: 'plate_no_in',
            header: 'PLATE NO.',
            render: (item) => item.vehicle_plate_number,
        },
        {
            key: 'arrival_time',
            header: 'TIME',
            render: (item) =>
                new Date(item.arrival_time).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }),
        },
        // {
        //     key: 'driver_in',
        //     header: 'DRIVER',
        //     render: (item) => item.full_name,
        // },
    ];

    return (
        <div>
            <TabContent
                onExport={() => {
                    const routeName = route?.id === 'all' ? 'AllRoutes' : route?.route_name?.replace(/\s+/g, '_') || 'Unknown';
                    const plateNum = plateNumber?.isAll ? 'AllPlates' : plateNumber?.vehicle_plate_number?.replace(/\s+/g, '_') || 'Unknown';
                    ExcelGenerator.exportBusTripReport(data, `BusTripReport_${routeName}_${plateNum}_${dateUtils.fileDate(date)}`, date);
                }}
                title="Bus Trip Report">
                <div className="relative">
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="w-full lg:w-auto">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select date, route, and vehicle for your BIR POS sales report
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                                <div className="min-w-[160px]">
                                    <DateButton
                                        onChange={setDate}
                                        selectedDate={date}
                                        title="Date"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                        aria-label="Select date for report"
                                    />
                                </div>
                                <div className="min-w-[200px]">
                                    {routes?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Routes"
                                            options={routes}
                                            displayField="route_name"
                                            onChange={setRoute}
                                            value={route}
                                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow"
                                            aria-label="Select route for report"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                                            No routes available
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-[200px]">
                                    {vehiclePlateNumbers?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Plate Number"
                                            options={vehiclePlateNumbers}
                                            displayField="vehicle_plate_number"
                                            onChange={setPlateNumber}
                                            value={plateNumber}
                                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow"
                                            aria-label="Select vehicle serial number for report"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                                            No plate numbers available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <Loader />
                    ) : (
                        <DataTable
                            columns={columns}
                            data={data}
                            enablePagination={true}
                            className="border border-[var(--color-secondary-light)]"
                        />
                    )}
                </div>
            </TabContent>
        </div>
    )
}
