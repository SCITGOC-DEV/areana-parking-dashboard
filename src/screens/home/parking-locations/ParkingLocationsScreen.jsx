import { useState } from "react";
import { useQuery } from "@apollo/client";
import { DataTable } from "../../../common/DataTable";
import { Loader } from "../../../components/Loader";
import parkingLocation from "../../../graphql/queries/parkingLocation";
import { formatDateToMMDDYYYY } from "../../../utils/Constants";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { AddParkingLocationDialog } from "./AddParkingLocationDialog";
import { UpdateParkingLocationDialog } from "./UpdateParkingLocationDialog";
import { DeleteParkingLocationDialog } from "./DeleteParkingLocationDialog";

export const ParkingLocationsScreen = () => {
    const { data, loading, error, refetch } = useQuery(parkingLocation.GET_PARKING_LOCATIONS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showUpdate, setShowUpdate] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const filtered = data?.parking_locations?.filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            l.name?.toLowerCase().includes(q) ||
            l.code?.toLowerCase().includes(q) ||
            l.address?.toLowerCase().includes(q)
        );
    }) || [];

    const columns = [
        { key: 'name', header: 'NAME', render: (item) => <span className="font-medium">{item.name}</span> },
        { key: 'code', header: 'CODE', render: (item) => item.code || 'N/A' },
        { key: 'address', header: 'ADDRESS', render: (item) => item.address || 'N/A', hideOnMobile: true },
        {
            key: 'coordinates',
            header: 'COORDINATES',
            render: (item) => item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : 'N/A',
            hideOnMobile: true,
        },
        {
            key: 'active',
            header: 'STATUS',
            render: (item) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.active
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                    {item.active ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'created_at',
            header: 'CREATED AT',
            render: (item) => formatDateToMMDDYYYY(item.created_at),
            hideOnMobile: true,
        },
        {
            key: 'actions',
            header: 'ACTIONS',
            render: (item) => (
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelected(item); setShowUpdate(true); }}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                        title="Edit"
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelected(item); setShowDelete(true); }}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Delete"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) return <Loader />;

    if (error) return (
        <div className="mb-4 w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-100">Failed to load parking locations. {error.message}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center p-4 sm:p-6">
            <div className="mb-4 w-full">
                <div className="relative">
                    <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by name, code or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <div className="w-full bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                <DataTable
                    columns={columns}
                    data={filtered}
                    title="Parking Locations"
                    emptyMessage="No parking locations found"
                    enablePagination
                    actions={[
                        {
                            label: "Add Location",
                            onClick: () => setShowAdd(true),
                            variant: "primary",
                            icon: <FiPlus className="w-4 h-4" />
                        }
                    ]}
                />
            </div>

            <AddParkingLocationDialog isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={refetch} />
            <UpdateParkingLocationDialog isOpen={showUpdate} onClose={() => setShowUpdate(false)} onSuccess={refetch} location={selected} />
            <DeleteParkingLocationDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onSuccess={refetch} location={selected} />
        </div>
    );
};
