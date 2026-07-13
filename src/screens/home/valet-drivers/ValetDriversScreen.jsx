import { useState } from "react";
import { useQuery } from "@apollo/client";
import { DataTable } from "../../../common/DataTable";
import valetDriver from "../../../graphql/queries/valetDriver";
import { Loader } from "../../../components/Loader";
import { formatDateToMMDDYYYY } from "../../../utils/Constants";
import { FiUserPlus, FiEdit, FiTrash2, FiKey, FiMapPin } from "react-icons/fi";
import { AddValetDriverDialog } from "./AddValetDriverDialog";
import { UpdateValetDriverDialog } from "./UpdateValetDriverDialog";
import { DeleteValetDriverDialog } from "./DeleteValetDriverDialog";
import { ChangeValetDriverPasswordDialog } from "./ChangeValetDriverPasswordDialog";
import { ChangeValetDriverLocationDialog } from "./ChangeValetDriverLocationDialog";

export const ValetDriversScreen = () => {
  const { data, loading, error, refetch } = useQuery(valetDriver.GET_VALET_DRIVERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [viewDriver, setViewDriver] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangeLocation, setShowChangeLocation] = useState(false);

  const filteredDrivers = data?.valet_drivers?.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.phone?.toLowerCase().includes(q) ||
      d.employee_code?.toLowerCase().includes(q)
    );
  }) || [];

  const statusColors = {
    AVAILABLE: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    ON_DUTY: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    OFF_DUTY: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    INACTIVE: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    SUSPENDED: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  const columns = [
    {
      key: "name",
      header: "NAME",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${item.status === 'AVAILABLE' ? 'bg-green-500' : item.status === 'ON_DUTY' ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
          <span>{item.name || "N/A"}</span>
        </div>
      ),
    },
    { key: "email", header: "EMAIL", render: (item) => item.email || "N/A" },
    { key: "phone", header: "PHONE", render: (item) => item.phone || "N/A" },
    { key: "employee_code", header: "EMPLOYEE CODE", render: (item) => item.employee_code || "N/A" },
    // {
    //   key: "status",
    //   header: "STATUS",
    //   render: (item) => (
    //     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status] || 'bg-gray-50 text-gray-500'}`}>
    //       {item.status || "N/A"}
    //     </span>
    //   ),
    // },
    {
      key: "locations",
      header: "ASSIGNED LOCATIONS",
      render: (item) => {
        const locs = item.valet_driver_parking_locations || [];
        if (locs.length === 0) return <span className="text-xs text-gray-400">None</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {locs.map(l => (
              <span key={l.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <FiMapPin className="w-3 h-3" />{l.parking_location?.name}
              </span>
            ))}
          </div>
        );
      },
      hideOnMobile: true,
    },
    {
      key: "email_verified",
      header: "EMAIL VERIFIED",
      render: (item) => (
        <span className={`text-xs font-medium ${item.email_verified ? 'text-green-600' : 'text-red-500'}`}>
          {item.email_verified ? "Yes" : "No"}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "last_login",
      header: "LAST LOGIN",
      render: (item) => item.last_login ? formatDateToMMDDYYYY(item.last_login) : "N/A",
      hideOnMobile: true,
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (item) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowUpdate(true); }} className="text-blue-500 hover:text-blue-600 transition-colors" title="Edit"><FiEdit className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowChangeLocation(true); }} className="text-green-500 hover:text-green-600 transition-colors" title="Change Location"><FiMapPin className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowPassword(true); }} className="text-yellow-500 hover:text-yellow-600 transition-colors" title="Change Password"><FiKey className="w-4 h-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedDriver(item); setShowDelete(true); }} className="text-red-500 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (error) return (
    <div className="mb-4 w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
      <p className="text-sm text-red-700 dark:text-red-100">Failed to load valet drivers. {error.message}</p>
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
            placeholder="Search by name, email, phone or employee code..."
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
          title="Cashiers"
          emptyMessage="No cashiers found"
          enablePagination
          onRowClick={setViewDriver}
          actions={[{ label: "Add Cashier", onClick: () => setShowAdd(true), variant: "primary", icon: <FiUserPlus className="w-4 h-4" /> }]}
        />
      </div>

      {/* Detail Modal */}
      {viewDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setViewDriver(null)}>
          <div className="bg-[var(--color-bg-primary)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-secondary-light)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{viewDriver.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{viewDriver.employee_code || 'No employee code'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[viewDriver.status] || 'bg-gray-50 text-gray-500'}`}>{viewDriver.status}</span>
                <button onClick={() => setViewDriver(null)} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Contact</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[['Email', viewDriver.email], ['Phone', viewDriver.phone], ['Email Verified', viewDriver.email_verified ? 'Yes' : 'No'], ['Phone Verified', viewDriver.phone_verified ? 'Yes' : 'No']].map(([l, v]) => (
                    <div key={l}><p className="text-xs text-[var(--color-text-secondary)]">{l}</p><p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{v || 'N/A'}</p></div>
                  ))}
                </div>
              </div>
              {/* Assigned Locations */}
              <div className="border-t border-[var(--color-secondary-light)] pt-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">Assigned Parking Locations</h3>
                {viewDriver.valet_driver_parking_locations?.length > 0 ? (
                  <div className="space-y-2">
                    {viewDriver.valet_driver_parking_locations.map(l => (
                      <div key={l.id} className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">{l.parking_location?.name}</span>
                          {l.parking_location?.code && <span className="text-xs text-[var(--color-text-secondary)]">({l.parking_location.code})</span>}
                        </div>
                        {l.parking_location?.address && <p className="text-xs text-[var(--color-text-secondary)] mt-1 ml-6">{l.parking_location.address}</p>}
                        {l.note && <p className="text-xs text-[var(--color-text-secondary)] mt-1 ml-6">Note: {l.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)]">No locations assigned.</p>
                )}
              </div>
              {/* Last Login */}
              <div className="border-t border-[var(--color-secondary-light)] pt-4">
                <h3 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Activity</h3>
                <div><p className="text-xs text-[var(--color-text-secondary)]">Last Login</p><p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{viewDriver.last_login ? formatDateToMMDDYYYY(viewDriver.last_login) : 'Never'}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddValetDriverDialog isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={refetch} />
      <UpdateValetDriverDialog isOpen={showUpdate} onClose={() => setShowUpdate(false)} onSuccess={refetch} driver={selectedDriver} />
      <DeleteValetDriverDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onSuccess={refetch} driver={selectedDriver} />
      <ChangeValetDriverPasswordDialog isOpen={showPassword} onClose={() => setShowPassword(false)} onSuccess={refetch} driverId={selectedDriver?.id} />
      <ChangeValetDriverLocationDialog isOpen={showChangeLocation} onClose={() => setShowChangeLocation(false)} onSuccess={refetch} driver={selectedDriver} />
    </div>
  );
};
