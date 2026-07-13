import ExcelGenerator from "../../utils/ExcelGenerator";
import { DateButton, DropdownButton, getOneMonthEarlier } from "./AnexBReportContent";
import React, { useEffect, useState } from "react";
import { TabContent } from "../home/ReportScreen";
import RouteQueries from "../../graphql/queries/RouteQueries";
import { useLazyQuery, useMutation } from "@apollo/client";
import vehicle from "../../graphql/queries/vehicle";
import { Loader } from "../../components/Loader";
import { DataTable } from "../../common/DataTable";
import dateUtils from "../../utils/DateUtils";
import bus_stop from "../../graphql/queries/bus_stop";
import DateUtils from "../../utils/DateUtils";
import { SearchableDropdown } from "../../components/SearchableDropdown";
import {formatDateToMMDDYYYY, formatDateToYYYYMMDD} from "../../utils/Constants";
import {updateHasuraRole} from "../../api/apolloClient";

const directions = [
    {
        key: "Northbound",
        label: "North bound",
    },
    {
        key: "Southbound",
        label: "South bound",
    }
]

export const StationReportContent = () => {
    const [data, setData] = useState([]);
    const [endDate, setEndDate] = useState(new Date());
    const [direction, setDirection] = useState(directions[0])
    const [route, setRoute] = useState(null)
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false)
    const [busStops, setBusStops] = useState([])
    const [selectedBusStop, setSelectedBusStop] = useState(null)

    const [getExportData] = useMutation(vehicle.GET_STATION_REPORT_DATA, {
        onCompleted: (data) => {
            setTimeout(() => {
                setLoading(false)
                if (data.response.data?.length > 0) setData(data.response.data)
            }, 400)
        },
        onError: (error) => {
            setLoading(false)
            console.log('error', error.message.toString())
        }
    })

    const [getAllBusStopsInTheRoute] = useLazyQuery(bus_stop.GET_ALL_BUS_STOPS_BY_ROUTE_ID, {
        onCompleted: (data) => {
            const stops = data.response.map(item => item.bus_stop);
            setBusStops(stops);
            console.log('bus stops', busStops);
            if (stops.length > 0) {
                setSelectedBusStop(stops[0])
            } else {
                setBusStops([])
                setSelectedBusStop(null)
            }
        },
    })

    const [getAllRoutes] = useLazyQuery(RouteQueries.GET_ALL_ROUTES, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            console.log('data', data);
            if (data.routes.length > 0) {
                const firstRoute = data.routes[0];
                console.log('route', firstRoute.id);

                getAllBusStopsInTheRoute({ variables: { routeId: firstRoute.id } })
                setRoute(firstRoute)
            }
            setRoutes(data.routes)
        },
    })

    const handleRouteSelect = async (route) => {
        setRoute(route)
    }

    useEffect(() => {
        console.log('route: ', route)
        if (route !== null) {
            setTimeout(() => {
                updateHasuraRole("super_admin")
                getAllBusStopsInTheRoute({ variables: { routeId: Number(route?.id) } })
            },300)
        }
    }, [route]);

    const columns = [
        {
            key: 'vehiclePlateNumber',
            header: 'PLATE NO.',
            render: (item) => item.vehiclePlateNumber,
        },
        {
            key: 'busStopTime',
            header: 'TIME',
            render: (item) => (
                <span className="text-gray-800 dark:text-gray-200">
                    {`${formatDateToMMDDYYYY(new Date(item.busStopTime))} ${DateUtils.getFormattedTime(item.busStopTime)}`}
                </span>
            )
        },
        {
            key: 'count',
            header: 'TOTAL PAX',
            render: (item) => item.count,
        },
        {
            key: 'vehicleRouteId',
            header: 'ROUTE ID',
            render: (item) => item.vehicleRouteId,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            updateHasuraRole("super_admin")
            getAllRoutes()
        },400)
    }, []);

    useEffect(() => {
        if (route === null) return;
        setLoading(true)
        setData([])
        const variables = {
            date: formatDateToYYYYMMDD(endDate),
            routeId: parseInt(route?.id, 10),
            direction: direction.key,
            busStopId: Number(selectedBusStop?.id ?? 0)
        }
        console.log('variables: ', variables)

        updateHasuraRole("stationary_report")
        getExportData({
            variables: variables
        })
    }, [endDate, direction, route, selectedBusStop])

    return (
        <div>
            <TabContent
                onExport={() => ExcelGenerator.exportStationReport(data, `StationTripReport_${dateUtils.fileDate(endDate)}`, route.route_name, selectedBusStop?.bus_stop_name)}
                title="Station Trip Report">
                <div className="relative">
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="w-full lg:w-auto">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Report Filters
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Select date, direction, route, and bus stop for your BIR POS sales report
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                                {/*<DateButton onChange={setStartDate} selectedDate={startDate} title="Start Date"/>*/}
                                <div className="min-w-[160px]">
                                    <DateButton
                                        onChange={setEndDate}
                                        selectedDate={endDate}
                                        title="Date"
                                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow w-full"
                                        aria-label="Select date for report"
                                    />
                                </div>
                                <div className="min-w-[200px]">
                                    {directions?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Direction"
                                            options={directions}
                                            displayField="label"
                                            onChange={setDirection}
                                            value={direction}
                                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow"
                                            aria-label="Select direction for report"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                                            No directions available
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-[200px]">
                                    {routes?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Routes"
                                            options={routes}
                                            displayField="route_name"
                                            onChange={handleRouteSelect}
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
                                    {busStops?.length > 0 ? (
                                        <SearchableDropdown
                                            label="Bus Stops"
                                            options={busStops}
                                            displayField="bus_stop_name"
                                            onChange={setSelectedBusStop}
                                            value={selectedBusStop}
                                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md shadow-sm hover:shadow-md transition-shadow"
                                            aria-label="Select bus stop for report"
                                        />
                                    ) : (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 py-3">
                                            No bus stops available
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
