import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { DataTable } from "../../../common/DataTable";
import driverQueries from "../../../graphql/queries/driver";
import { Loader } from "../../../components/Loader";
import { formatDateToMMDDYYYY } from "../../../utils/Constants";
import { FiUserPlus, FiEdit, FiTrash2, FiPower } from "react-icons/fi";
import { AddDriverDialog } from "./AddDriverDialog";
import { UpdateDriverDialog } from "./UpdateDriverDialog";
import { DeleteDriverDialog } from "./DeleteDriverDialog";
import { ToastType, useToast } from "../../../context/ToastProvider";

export const DriversScreen = () => {
  const { data, loading, error, refetch } = useQuery(driverQueries.GET_DRIVERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { addToast } = useToast();

  const [updateDriverStatus] = useMutation(driverQueries.UPDATE_DRIVER_STATUS, {
    onCompleted: () => {
      addToast("Driver status updated successfully", ToastType.Success);
      refetch();
    },
    onError: (error) => {
      addToast(error.message || "Failed to update driver status", ToastType.Error);
    }
  });

  const filteredDrivers = data?.drivers?.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.full_name?.toLowerCase().includes(q) ||
      d.first_name?.toLowerCase().includes(q) ||
      d.last_name?.toLowerCase().includes(q) ||
      d.user_name?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q)
    );
  }) || [];

  const columns = [
    {
      key: "full_name",
      header: "NAME",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500' : 'bg-red-400'}`}></span>
          <span>{item.full_name || `${item.last_name}, ${item.first_name}`}</span>
        </div>
      ),
    },
    { key: "user_name", header: "USERNAME", render: (item) => item.user_name || "N/A" },
    { key: "phone", header: "PHONE", render: (item) => item.phone || "N/A" },
    {
      key: "status",
      header: "STATUS",
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
          {item.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "CREATED AT",
      render: (item) => item.created_at ? formatDateToMMDDYYYY(item.created_at) : "N/A",
      hideOnMobile: true,
    },
    {
      key: "updated_at",
      header: "LAST UPDATED",
      render: (item) => item.updated_at ? formatDateToMMDDYYYY(item.updated_at) : "N/A",
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (item) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowUpdate(true); }} className="text-blue-500 hover:text-blue-600 transition-colors" title="Edit"><FiEdit className="w-4 h-4" /></button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateDriverStatus({
                variables: {
                  id: item.id,
                  active: !item.active
                }
              });
            }}
            className="text-orange-500 hover:text-orange-600 transition-colors"
            title={item.active ? "Deactivate" : "Activate"}
          >
            <FiPower className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowDelete(true); }} className="text-red-500 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (error) return (
    <div className="mb-4 w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
      <p className="text-sm text-red-700 dark:text-red-100">Failed to load drivers. {error.message}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
      <div className="mb-4 w-full flex">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, username or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={filteredDrivers}
          title="Drivers"
          emptyMessage="No drivers found"
          enablePagination
          onRowClick={setViewDriver}
          actions={[{ label: "Add Driver", onClick: () => setShowAdd(true), variant: "primary", icon: <FiUserPlus className="w-4 h-4" /> }]}
        />
      </div>

      {/* Detail Modal */}
      {viewDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setViewDriver(null)}>
          <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-secondary-light)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{viewDriver.full_name || `${viewDriver.last_name}, ${viewDriver.first_name}`}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">@{viewDriver.user_name || 'No username'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${viewDriver.active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                  {viewDriver.active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => setViewDriver(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Profile Details */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Profile</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[['First Name', viewDriver.first_name], ['Last Name', viewDriver.last_name], ['Username', viewDriver.user_name], ['Phone', viewDriver.phone]].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[var(--color-text-secondary)]">{l}</p><p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{v || 'N/A'}</p></div>
                  ))}
                </div>
              </div>
              {/* Timestamps */}
              <div className="border-t border-[var(--color-secondary-light)] pt-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">System</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Created At</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{viewDriver.created_at ? formatDateToMMDDYYYY(viewDriver.created_at) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Last Updated</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{viewDriver.updated_at ? formatDateToMMDDYYYY(viewDriver.updated_at) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-[var(--color-secondary-light)] bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
              <button onClick={() => setViewDriver(null)} className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Components */}
      <AddDriverDialog isOpen={showAdd} onClose={() => setShowAdd(false)} onAddSuccess={refetch} />
      <UpdateDriverDialog isOpen={showUpdate} onClose={() => { setShowUpdate(false); setSelectedDriver(null); }} onSuccess={refetch} driver={selectedDriver} />
      <DeleteDriverDialog isOpen={showDelete} onClose={() => { setShowDelete(false); setSelectedDriver(null); }} onSuccess={refetch} driver={selectedDriver} />
    </div>
  );
};
