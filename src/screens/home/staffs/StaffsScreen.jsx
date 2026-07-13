import { useEffect, useState } from "react";
import { DataTable } from "../../../common/DataTable";
import staff from "../../../graphql/queries/staff";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { ToastType, useToast } from "../../../context/ToastProvider";
import { Loader } from "../../../components/Loader";
import { AddStaffDialog } from "./AddStaffDialog";
import { UpdateStaffDialog } from "./UpdateStaffDialog";
import { ChangeStaffPasswordDialog } from "./ChangeStaffPasswordDialog";
import { formatDateToMMDDYYYY } from "../../../utils/Constants";
import { FiUserPlus, FiEdit, FiPower, FiTrash2, FiKey } from "react-icons/fi";

export const StaffsScreen = () => {
  const navigate = useNavigate();
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false);
  const [showEditStaffDialog, setShowEditStaffDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { addToast } = useToast();
  const { data, loading, error, refetch } = useQuery(staff.GET_STAFFS);
  const [staffId, setStaffId] = useState(null);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [updateStaffStatus] = useMutation(staff.UPDATE_STAFF_STATUS, {
    onCompleted: (data) => {
      refetch();
      if (data.results.error === 1) {
        addToast(data.results.message, ToastType.Error);
      } else {
        addToast("POS Account status updated successfully", ToastType.Success);
      }
    },
    onError: (error) => {
      addToast(
        error.message.toString() || "Something went wrong.",
        ToastType.Error
      );
    },
  });

    useEffect(() => {
        console.log('staffs: ' + data)
    }, [data]);


  // Debounce search input to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter staffs based on search query
  const filteredStaffs =
    data?.staffs?.filter((staff) => {
      if (!debouncedSearchQuery.trim()) return true;

      const query = debouncedSearchQuery.toLowerCase();
      const searchFields = [
        staff.full_name,
        staff.phone,
        staff.device_id,
        staff.created_at && formatDateToMMDDYYYY(staff.created_at),
        staff.updated_at && formatDateToMMDDYYYY(staff.updated_at),
      ];

      return searchFields.some(
        (field) => field && field.toString().toLowerCase().includes(query)
      );
    }) || [];

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const columns = [
    {
      key: "full_name",
      header: "FULL NAME",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{item.full_name || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "PHONE NUMBER",
      render: (item) => item.phone || "N/A",
    },
    {
      key: "device_id",
      header: "DEVICE ID",
      render: (item) => item.device_id || "N/A",
      hideOnMobile: true,
    },
    {
      key: "created_at",
      header: "CREATED AT",
      render: (item) => formatDateToMMDDYYYY(item.created_at),
      hideOnMobile: true,
    },
    {
      key: "updated_at",
      header: "LAST UPDATED",
      render: (item) => formatDateToMMDDYYYY(item.updated_at),
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "STATUS",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.active
              ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {item.active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      render: (item) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStaffId(item.id);
              setShowEditStaffDialog(true);
            }}
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Edit"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateStaffStatus({
                variables: {
                  id: item.id,
                  active: !item.active,
                },
              });
            }}
            className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
            title={item.active ? "Deactivate" : "Activate"}
          >
            <FiPower className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStaffId(item.id);
              setShowChangePasswordDialog(true);
            }}
            className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
            title="Change Password"
          >
            <FiKey className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loader />;

  if (error) {
    const roleError =
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("requested role is not in allowed roles".toLowerCase());

    if (roleError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-red-200 dark:border-red-700/60">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-7 w-7 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0020.9 16.6L13.8 4.6a2 2 0 00-3.6 0L3.1 16.6A2 2 0 005.07 19z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Permission issue
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Your current role is not allowed to access the POS Accounts screen. You can go back to a page that is available for your role.
            </p>
            <button
              type="button"
              onClick={() => navigate("/home/dashboard")}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 w-full bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 dark:text-red-100">
              Failed to load pos account. {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
      <div className="mb-4 w-full flex">
        <AddStaffDialog
          isOpen={showAddStaffDialog}
          onClose={() => setShowAddStaffDialog(false)}
          onAddSuccess={() => {
            refetch();
            setShowAddStaffDialog(false);
          }}
        />

        {/* Update Staff Dialog */}
        <UpdateStaffDialog
          isOpen={showEditStaffDialog}
          onClose={() => setShowEditStaffDialog(false)}
          onUpdateSuccess={() => {
            refetch();
            setShowEditStaffDialog(false);
          }}
          staffId={staffId}
        />

        {/* Change Password Dialog */}
        <ChangeStaffPasswordDialog
          isOpen={showChangePasswordDialog}
          onClose={() => setShowChangePasswordDialog(false)}
          onSuccess={() => {
            refetch();
            setShowChangePasswordDialog(false);
          }}
          staffId={staffId}
        />

        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search POS Accounts by name, phone, device ID or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <DataTable
          columns={columns}
          data={filteredStaffs}
          title="POS Accounts"
          className="border-none"
          actions={[
            {
              label: "Add POS Account",
              onClick: () => setShowAddStaffDialog(true),
              variant: "primary",
              icon: <FiUserPlus className="w-4 h-4" />
            },
          ]}
          emptyMessage={
            debouncedSearchQuery
              ? "No Pos account match your search criteria"
              : "No Pos account available"
          }
        />
      </div>
    </div>
  );
};
