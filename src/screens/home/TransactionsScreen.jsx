import { useEffect, useRef, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import TicketQueries from "../../graphql/queries/TicketQueries";
import StaffQueries from "../../graphql/queries/staff";
import { ToastType, useToast } from "../../context/ToastProvider";
import { useLocation } from "react-router-dom";
import { Loader } from "../../components/Loader";
import { DataTable } from "../../common/DataTable";
import ExcelGenerator from "../../utils/ExcelGenerator";
import {FaPrint} from "react-icons/fa";
import PDFGenerator from "../../utils/PDFGenerator";
import { formatDateToMMDDYYYY } from "../../utils/Constants";

const generateTicketId = (machineId, ticketId) => {
    // Convert to strings and pad with leading zeros
    const paddedMachineId = String(machineId).padStart(2, '0'); // 2 digits for machine ID
    const paddedTicketId = String(ticketId).padStart(8, '0');   // 8 digits for ticket ID

    return paddedMachineId + paddedTicketId;
  }

  export const TransactionsScreen = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalMounted, setIsModalMounted] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        ticketId: '',
        busNumber: '',
        passengerName: '',
        paymentMethod: '',
        dateFrom: '',
        dateTo: '',
        routeName: '',
        machineSerialNo: '',
        staffId: '',
        staffName: '',
        accessDecision: 'all',
        boarded: 'all'
    });
    const [suggestions, setSuggestions] = useState({
        ticketId: [],
        busNumber: [],
        passengerName: [],
        paymentMethod: [],
        routeName: [],
        machineSerialNo: [],
        staffId: []
    });
    const [activeSuggestionField, setActiveSuggestionField] = useState(null);
    const { addToast } = useToast();
    const location = useLocation();
    const suggestionRefs = useRef({});

    const [loadStaff] = useLazyQuery(StaffQueries.GET_STAFFS_NAME, {
        fetchPolicy: "network-only",
    });

    const [loadTickets] = useLazyQuery(TicketQueries.GET_ALL_TICKETS, {
        fetchPolicy: "network-only",
        onCompleted: async (data) => {
            try {
                // Fetch staff data
                const staffResult = await loadStaff();
                const staffMap = {};
                
                if (staffResult.data?.staffs) {
                    staffResult.data.staffs.forEach(staff => {
                        staffMap[staff.id] = staff;
                    });
                }

                // Merge staff data with tickets
                const ticketsWithStaff = data.response.map(ticket => ({
                    ...ticket,
                    staff: ticket.staff_id ? staffMap[ticket.staff_id] : null
                }));

                setTimeout(() => {
                    setLoading(false);
                    setTickets(ticketsWithStaff);
                    setFilteredTickets(ticketsWithStaff);
                    
                    // Create staff suggestions with both id and name
                    const staffSuggestions = [...new Set(
                        ticketsWithStaff
                            .filter(ticket => ticket.staff_id && ticket.staff?.full_name)
                            .map(ticket => JSON.stringify({ id: ticket.staff_id, name: ticket.staff.full_name }))
                    )].map(str => JSON.parse(str));
                    
                    setSuggestions({
                        ticketId: [...new Set(ticketsWithStaff.map(ticket => generateTicketId(ticket.machine_id, ticket.ticket_id)))],
                        busNumber: [...new Set(ticketsWithStaff.map(ticket => ticket.vehicle_route?.vehicle?.vehicle_plate_number).filter(Boolean))],
                        passengerName: [...new Set(ticketsWithStaff.map(ticket => ticket.registered_name).filter(Boolean))],
                        paymentMethod: [...new Set(ticketsWithStaff.map(ticket => ticket.payment_method).filter(Boolean))],
                        routeName: [...new Set(ticketsWithStaff.map(ticket => ticket.vehicle_route?.route?.route_name).filter(Boolean))],
                        machineSerialNo: [...new Set(ticketsWithStaff.map(ticket => ticket.machine?.serial_number).filter(Boolean))],
                        staffId: staffSuggestions
                    });
                }, 500);
            } catch (err) {
                setLoading(false);
                addToast(err.message, ToastType.Error);
            }
        },
        onError: (err) => {
            setLoading(false);
            addToast(err.message, ToastType.Error);
        }
    });

    useEffect(() => {
        if (selectedTicket) {
            requestAnimationFrame(() => {
                setIsModalMounted(true);
            });
        }
    }, [selectedTicket]);

    useEffect(() => {
        setLoading(true);
        loadTickets();
    }, [location.key]);

    useEffect(() => {
        applyFilters();
    }, [filters, tickets]);

    const applyFilters = () => {
        let result = [...tickets];

        if (filters.ticketId) {
            result = result.filter(ticket => {
                const fullTicketId = generateTicketId(ticket.machine_id, ticket.ticket_id);
                return fullTicketId.toLowerCase().includes(filters.ticketId.toLowerCase());
            });
        }

        if (filters.busNumber) {
            result = result.filter(ticket =>
                ticket.vehicle_route?.vehicle?.vehicle_plate_number &&
                ticket.vehicle_route.vehicle.vehicle_plate_number.toLowerCase().includes(filters.busNumber.toLowerCase())
            );
        }

        if (filters.passengerName) {
            result = result.filter(ticket =>
                ticket.registered_name &&
                ticket.registered_name.toLowerCase().includes(filters.passengerName.toLowerCase())
            );
        }

        if (filters.paymentMethod) {
            result = result.filter(ticket =>
                ticket.payment_method &&
                ticket.payment_method.toLowerCase().includes(filters.paymentMethod.toLowerCase())
            );
        }

        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            result = result.filter(ticket => {
                const ticketDate = new Date(ticket.created_at);
                return ticketDate >= fromDate;
            });
        }

        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            result = result.filter(ticket => {
                const ticketDate = new Date(ticket.created_at);
                return ticketDate <= toDate;
            });
        }

        if (filters.routeName) {
            result = result.filter(ticket =>
                ticket.vehicle_route?.route?.route_name &&
                ticket.vehicle_route.route.route_name.toLowerCase().includes(filters.routeName.toLowerCase())
            );
        }

        if (filters.machineSerialNo) {
            result = result.filter(ticket =>
                ticket.machine?.serial_number &&
                ticket.machine.serial_number.toLowerCase().includes(filters.machineSerialNo.toLowerCase())
            );
        }

        if (filters.staffId) {
            result = result.filter(ticket =>
                ticket.staff_id &&
                ticket.staff_id.toString().includes(filters.staffId)
            );
        }
        
        // Add filter logic for accessDecision
        if (filters.accessDecision && filters.accessDecision !== 'all') {
            result = result.filter(ticket => {
                if (filters.accessDecision === 'accept') {
                    return ticket.access_decision === true;
                } else if (filters.accessDecision === 'deny') {
                    return ticket.access_decision === false;
                }
                return true;
            });
        }

        // Add filter logic for boarded
        if (filters.boarded && filters.boarded !== 'all') {
            result = result.filter(ticket => {
                if (filters.boarded === 'yes') {
                    return ticket.boarded === true;
                } else if (filters.boarded === 'no') {
                    return ticket.boarded === false;
                }
                return true;
            });
        }

        setFilteredTickets(result);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'staffName') {
            setFilters(prev => ({
                ...prev,
                staffName: value,
                staffId: '' // Clear staffId when manually typing
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setActiveSuggestionField(name);
    };

    const handleSuggestionClick = (field, value, extraData = null) => {
        if (field === 'staffId') {
            setFilters(prev => ({
                ...prev,
                staffId: value,
                staffName: extraData
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [field]: value
            }));
        }
        setActiveSuggestionField(null);
    };

    const resetFilters = () => {
        setFilters({
            ticketId: '',
            busNumber: '',
            passengerName: '',
            paymentMethod: '',
            dateFrom: '',
            dateTo: '',
            routeName: '',
            machineSerialNo: '',
            staffId: '',
            staffName: '',
            accessDecision: 'all',
            boarded: 'all'
        });
        setActiveSuggestionField(null);
    };

    const columns = [
        {
            key: 'ticket_id',
            header: 'Ticket ID',
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
            key: 'machine_serial_number',
            header: 'Machine Serial No',
            render: (item) => (
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {item.machine?.serial_number || 'N/A'}
                </span>
            ),
            className: 'min-w-32',
        },
        {
            key: 'machine.serial_number',
            header: 'Bus Number',
            render: (item) => (
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A'}
                </span>
            )
        },
        {
            key: 'route_name',
            header: 'Route',
            render: (item) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {item.vehicle_route?.route?.route_name || 'N/A'}
                </span>
            ),
            className: 'font-medium'
        },
        {
            key: 'registered_name',
            header: 'Passenger',
            render: (item) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {item.registered_name || 'Anonymous'}
                </span>
            ),
            className: 'font-medium'
        },
        {
            key: 'staff_name',
            header: 'POS Account',
            render: (item) => (
                <span className="text-gray-700 dark:text-gray-300">
                    {item.staff?.full_name || 'N/A'}
                </span>
            ),
            className: 'font-medium'
        },
        {
            key: 'ticket_cost',
            header: 'Gross Amount',
            render: (item) => (
                <span className="font-semibold text-gray-900 dark:text-white">
                    ₱{item.ticket_cost.toFixed(2)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'discount',
            header: 'Discount',
            render: (item) => {
                const discountAmount = item.ticket_cost * (item.discount / 100);
                return (
                    <span className="font-semibold text-gray-900 dark:text-white">
                        ₱{discountAmount.toFixed(2)}
                    </span>
                );
            },
            className: 'text-right'
        },
        {
            key: 'net_amount',
            header: 'Net Amount',
            render: (item) => (
                <span className="font-semibold text-gray-900 dark:text-white">
                    ₱{item.net_amount.toFixed(2)}
                </span>
            ),
            className: 'text-right'
        },
        {
            key: 'vat_amount',
            header: 'VAT Amount',
            render: (item) => (
                <span className="text-orange-700 dark:text-orange-300 font-mono">
                    ₱{(item.vat_amount ?? 0).toFixed(2)}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'vat_exempt_sales',
            header: 'VAT Exempt Sales',
            render: (item) => (
                <span className="text-purple-700 dark:text-purple-300 text-center font-mono">
                    ₱{item.ticket_cost !== undefined ? item.ticket_cost.toFixed(2) : '0.00'}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'vatable_sales',
            header: 'Vatable Sales',
            render: (item) => (
                <span className="text-green-700 dark:text-green-300 font-mono">
                    ₱{(item.vatable_sales ?? 0).toFixed(2)}
                </span>
            ),
            className: 'text-right',
        },
        {
            key: 'payment_method',
            header: 'Method',
            render: (item) => (
                <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {item.payment_method.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            key: 'created_at',
            header: 'Time',
            render: (item) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDateToMMDDYYYY(item.created_at)}
                </span>
            ),
            hideOnMobile: true
        },
        {
            key: 'validated',
            header: 'Status',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.validator_id ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {item.validator_id ? 'Validated' : 'Not Validated'}
                </span>
            )
        },
        {
            key: 'boarded',
            header: 'Used',
            render: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.boarded ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                    {item.boarded ? 'Yes' : 'No'}
                </span>
            )
        },
        {
            key: 'access_decision',
            header: 'Access Decision',
            render: (item) => {
                let bgColorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
                let text = 'Not Set';
                
                if (item.access_decision === true) {
                    bgColorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
                    text = 'Accept';
                } else if (item.access_decision === false) {
                    bgColorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                    text = 'Deny';
                }
                
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bgColorClass}`}>
                        {text}
                    </span>
                );
            }
        },
        {
            key: "edit",
            header: "Print",
            render: (item) => (
                <button
                    onClick={async (e) => {
                        e.stopPropagation();
                        try {
                            await PDFGenerator.generateTransactionItemPDF(item);
                        } catch (error) {
                            console.error('Error generating PDF:', error);
                            addToast('Error generating PDF', ToastType.Error);
                        }
                    }}
                    className="flex items-center gap-2 text-white px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 font-medium text-sm shadow-sm"
                >
                    <FaPrint className="text-xs" />
                    Print
                </button>
            ),
        },
    ];

    const handleCloseModal = () => {
        setIsModalMounted(false);
        setTimeout(() => {
            setSelectedTicket(null);
        }, 300);
    };

    if (loading) return <Loader />;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                        <p className="text-gray-500 dark:text-gray-400">View and manage all ticket transactions</p>
                    </div>
                    <button
                        onClick={() => ExcelGenerator.exportTransactionReports(filteredTickets, filters)}
                        disabled={filteredTickets.length === 0}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium text-sm
                            ${filteredTickets.length > 0
                                ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export To Excel
                    </button>
                </div>

                {/* Filters Card */}
                <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 font-medium"
                        >
                            Reset All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-b border-gray-100 dark:border-gray-700 py-4">
                        {/* Ticket ID */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="ticketId">Ticket ID</label>
                            <input
                                type="text"
                                name="ticketId"
                                id="ticketId"
                                value={filters.ticketId}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('ticketId')}
                                placeholder="Search ticket ID..."
                                aria-label="Ticket ID"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.ticketId && (
                                <button
                                    onClick={() => handleSuggestionClick('ticketId', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Ticket ID"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'ticketId' && suggestions.ticketId?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['ticketId'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.ticketId
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.ticketId.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('ticketId', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Machine Serial No */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="machineSerialNo">Machine Serial No</label>
                            <input
                                type="text"
                                name="machineSerialNo"
                                id="machineSerialNo"
                                value={filters.machineSerialNo || ''}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('machineSerialNo')}
                                placeholder="Search machine serial..."
                                aria-label="Machine Serial No"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.machineSerialNo && (
                                <button
                                    onClick={() => handleSuggestionClick('machineSerialNo', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Machine Serial No"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'machineSerialNo' && suggestions.machineSerialNo?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['machineSerialNo'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.machineSerialNo
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.machineSerialNo.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('machineSerialNo', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Bus Number */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="busNumber">Bus Number</label>
                            <input
                                type="text"
                                name="busNumber"
                                id="busNumber"
                                value={filters.busNumber}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('busNumber')}
                                placeholder="Search bus number..."
                                aria-label="Bus Number"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.busNumber && (
                                <button
                                    onClick={() => handleSuggestionClick('busNumber', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Bus Number"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'busNumber' && suggestions.busNumber?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['busNumber'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.busNumber
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.busNumber.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('busNumber', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Route */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="routeName">Route</label>
                            <input
                                type="text"
                                name="routeName"
                                id="routeName"
                                value={filters.routeName}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('routeName')}
                                placeholder="Search route..."
                                aria-label="Route"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.routeName && (
                                <button
                                    onClick={() => handleSuggestionClick('routeName', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Route"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'routeName' && suggestions.routeName?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['routeName'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.routeName
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.routeName.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('routeName', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Passenger */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="passengerName">Passenger</label>
                            <input
                                type="text"
                                name="passengerName"
                                id="passengerName"
                                value={filters.passengerName}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('passengerName')}
                                placeholder="Search passenger..."
                                aria-label="Passenger"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.passengerName && (
                                <button
                                    onClick={() => handleSuggestionClick('passengerName', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Passenger"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'passengerName' && suggestions.passengerName?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['passengerName'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.passengerName
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.passengerName.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('passengerName', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Staff */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="staffName">POS Account</label>
                            <input
                                type="text"
                                name="staffName"
                                id="staffName"
                                value={filters.staffName}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('staffId')}
                                placeholder="Search POS Acc..."
                                aria-label="POS Account"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.staffName && (
                                <button
                                    onClick={() => {
                                        setFilters(prev => ({ ...prev, staffName: '', staffId: '' }));
                                    }}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear POS Account"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'staffId' && suggestions.staffId?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['staffId'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.staffId
                                        .filter(staff => {
                                            const searchTerm = (filters.staffName || '').toLowerCase();
                                            return staff.name.toLowerCase().includes(searchTerm) ||
                                                   staff.id.toString().includes(filters.staffName || '');
                                        })
                                        .slice(0, 10)
                                        .map((staff, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('staffId', staff.id.toString(), staff.name)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {staff.name}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Payment Method */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="paymentMethod">Payment Method</label>
                            <input
                                type="text"
                                name="paymentMethod"
                                id="paymentMethod"
                                value={filters.paymentMethod}
                                onChange={handleFilterChange}
                                onFocus={() => setActiveSuggestionField('paymentMethod')}
                                placeholder="Search method..."
                                aria-label="Payment Method"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                            {filters.paymentMethod && (
                                <button
                                    onClick={() => handleSuggestionClick('paymentMethod', '')}
                                    className="absolute right-2 top-7 text-gray-400 hover:text-red-500 focus:outline-none"
                                    aria-label="Clear Payment Method"
                                >
                                    ×
                                </button>
                            )}
                            {activeSuggestionField === 'paymentMethod' && suggestions.paymentMethod?.length > 0 && (
                                <div
                                    ref={el => suggestionRefs.current['paymentMethod'] = el}
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                >
                                    {suggestions.paymentMethod
                                        .filter(suggestion => suggestion.toLowerCase().includes(filters.paymentMethod.toLowerCase()))
                                        .slice(0, 10)
                                        .map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick('paymentMethod', suggestion)}
                                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition-colors duration-150"
                                            >
                                                {suggestion}
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        {/* Date From */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="dateFrom">Date From</label>
                            <input
                                type="date"
                                name="dateFrom"
                                id="dateFrom"
                                value={filters.dateFrom}
                                onChange={handleFilterChange}
                                aria-label="Date From"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                        </div>
                        {/* Date To */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="dateTo">Date To</label>
                            <input
                                type="date"
                                name="dateTo"
                                id="dateTo"
                                value={filters.dateTo}
                                onChange={handleFilterChange}
                                aria-label="Date To"
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            />
                        </div>
                        {/* Access Decision */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="accessDecision">Access Decision</label>
                            <select
                                name="accessDecision"
                                id="accessDecision"
                                value={filters.accessDecision}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <option value="all">All</option>
                                <option value="accept">Accept</option>
                                <option value="deny">Deny</option>
                            </select>
                        </div>
                        {/* Boarded */}
                        <div className="relative">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400" htmlFor="boarded">Used</label>
                            <select
                                name="boarded"
                                id="boarded"
                                value={filters.boarded}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                            >
                                <option value="all">All</option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        Showing <span className="font-medium text-gray-700 dark:text-gray-300">{filteredTickets.length}</span> transactions
                    </span>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={filteredTickets}
                        onRowClick={setSelectedTicket}
                        className = "border-none"
                        enablePagination={true}
                    />
                </div>

                {/* Ticket Detail Modal */}
                {selectedTicket && (
                    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 
                        ${isModalMounted ? 'bg-opacity-50' : 'bg-opacity-0'} 
                        transition-opacity duration-300 ease-out bg-black`}
                    >
                        <div className={`transform transition-all duration-300 ease-out 
                            ${isModalMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                            bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] 
                            overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        Ticket Details
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {generateTicketId(selectedTicket.machine_id, selectedTicket.ticket_id)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200 text-gray-500 dark:text-gray-400"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Passenger Info */}
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <UserIcon className="h-4 w-4 text-indigo-500" />
                                        Passenger
                                    </h3>
                                    <DetailItem label="Full Name" value={selectedTicket.registered_name} />
                                    <DetailItem
                                        label="Date of Birth"
                                        value={selectedTicket.registered_date_of_birth
                                            ? formatDateToMMDDYYYY(selectedTicket.registered_date_of_birth)
                                            : 'N/A'}
                                    />
                                    <DetailItem label="Contact" value={selectedTicket.registered_phone} />
                                    <DetailItem label="Passenger Type" value={selectedTicket.passenger_type} />
                                    <DetailItem label="ID Number" value={selectedTicket.passenger_id_no} />
                                </div>

                                {/* Payment Info */}
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <CreditCardIcon className="h-4 w-4 text-indigo-500" />
                                        Payment
                                    </h3>
                                    <DetailItem label="Total Amount" value={`₱${(selectedTicket.ticket_cost ?? 0).toFixed(2)}`} />
                                    <DetailItem label="Net Amount" value={`₱${(selectedTicket.net_amount ?? 0).toFixed(2)}`} />
                                    <DetailItem label="Discount" value={`₱${((selectedTicket.ticket_cost ?? 0) * ((selectedTicket.discount ?? 0) / 100)).toFixed(2)}`} />
                                    <DetailItem label="VAT" value={`₱${(selectedTicket.vat_amount ?? 0).toFixed(2)}`} />
                                    <DetailItem
                                        label="Method"
                                        value={selectedTicket.payment_method?.replace(/_/g, ' ')}
                                    />
                                    <DetailItem
                                        label="Transaction Time"
                                        value={formatDateToMMDDYYYY(selectedTicket.created_at)}
                                    />
                                </div>

                                {/* Ticket Info */}
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <TicketIcon className="h-4 w-4 text-indigo-500" />
                                        Ticket
                                    </h3>
                                    <DetailItem
                                        label="Start Stop"
                                        value={selectedTicket.bus_fare?.start_bus_stop?.bus_stop_name}
                                    />
                                    <DetailItem
                                        label="End Stop"
                                        value={selectedTicket.bus_fare?.end_bus_stop?.bus_stop_name}
                                    />
                                    <DetailItem
                                        label="Direction"
                                        value={selectedTicket.bus_fare?.direction}
                                    />
                                    <DetailItem
                                        label="Fare"
                                        value={selectedTicket.bus_fare?.fare ? `₱${selectedTicket.bus_fare.fare.toFixed(2)}` : 'N/A'}
                                    />
                                </div>

                                {/* Route Info */}
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <RouteIcon className="h-4 w-4 text-indigo-500" />
                                        Route
                                    </h3>
                                    <DetailItem label="Start Stop" value={selectedTicket?.vehicle_route?.start_bus_stop?.bus_stop_name} />
                                    <DetailItem label="End Stop" value={selectedTicket?.vehicle_route?.end_bus_stop?.bus_stop_name} />
                                    <DetailItem label="Vehicle" value={selectedTicket?.vehicle_route?.vehicle?.vehicle_plate_number} />
                                    <DetailItem label="Route" value={selectedTicket?.vehicle_route?.route?.route_name} />
                                    <DetailItem label="Machine ID" value={selectedTicket?.machine?.serial_number} />
                                    <DetailItem label="Driver" value={selectedTicket?.driver?.full_name} />
                                </div>
                            </div>

                            {/* Footer with action buttons */}
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await PDFGenerator.generateTransactionItemPDF(selectedTicket);
                                        } catch (error) {
                                            console.error('Error generating PDF:', error);
                                            addToast('Error generating PDF', ToastType.Error);
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <FaPrint className="text-xs" />
                                    Print Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

// Helper icons for the modal sections
function UserIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function CreditCardIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
}

function TicketIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
    );
}

function RouteIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

export const DetailItem = ({ label, value, className = '' }) => (
    <div className={`flex justify-between items-start py-2 ${className} transition-colors duration-200 hover:bg-[var(--color-bg-secondary-hover)] px-2 rounded`}>
        <span className="text-sm text-[var(--color-text-secondary)] pr-4">
            {label}:
        </span>
        <span className="text-sm text-[var(--color-text-primary)] text-right font-medium max-w-[60%] break-words">
            {value || 'N/A'}
        </span>
    </div>
);
