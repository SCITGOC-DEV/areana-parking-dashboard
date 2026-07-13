import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ADMINS } from '../../../graphql/queries/admin';
import AppButton from '../../../components/AppButton';
import { Loader } from '../../../components/Loader';
import { AddAdminDialog } from './AddAdminDialog';
import { UpdateAdminDialog } from './UpdateAdminDialog';
import { DeleteAdminDialog } from './DeleteAdminDialog';
import { ChangeAdminPasswordDialog } from './ChangeAdminPasswordDialog';
import { FiPlus, FiUserPlus, FiEdit, FiTrash2, FiKey } from 'react-icons/fi';

const AdminsScreen = () => {
  const { data, loading, error, refetch } = useQuery(GET_ADMINS);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const filteredAndSortedAdmins = useMemo(() => {
    if (!data?.admins) return [];
    let filtered = data.admins.filter(admin => {
      const matchesSearch = admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && admin.active) ||
        (filterStatus === 'inactive' && !admin.active);
      return matchesSearch && matchesStatus;
    });
    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.full_name?.localeCompare(b.full_name);
      if (sortBy === 'category') return a.admin_category?.localeCompare(b.admin_category);
      return 0;
    });
  }, [data?.admins, searchTerm, filterStatus, sortBy]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <p className="text-red-500 mb-4">Failed to load administrators.</p>
        <AppButton onClick={() => refetch()}>Try Again</AppButton>
      </div>
    </div>
  );

  const totalAdmins = data?.admins?.length || 0;
  const activeAdmins = data?.admins?.filter(a => a.active)?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Administrators</h1>
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Total', value: totalAdmins, color: 'text-blue-600' },
                { label: 'Active', value: activeAdmins, color: 'text-green-600' },
                { label: 'Inactive', value: totalAdmins - activeAdmins, color: 'text-red-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 min-w-[70px] text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <AppButton onClick={() => setShowAddDialog(true)} className="inline-flex items-center">
            <FiUserPlus className="w-4 h-4 mr-2" /> Add Administrator
          </AppButton>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="flex flex-col gap-4">
          {filteredAndSortedAdmins.map((admin) => {
            const isSuperAdmin = admin.admin_category === 'super_admin';

            return (
              <div key={admin.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow ${isSuperAdmin ? 'bg-gradient-to-br from-purple-500 to-purple-600' : admin.active ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                        {admin.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{admin.full_name}</h3>
                          {!admin.active && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{admin.admin_category}</span>
                          {admin.email && <span className="truncate">{admin.email}</span>}
                          {admin.phone && <span>{admin.phone}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button onClick={() => { setSelectedAdmin(admin); setShowPasswordDialog(true); }} className="p-1.5 text-yellow-500 hover:text-yellow-600 transition-colors" title="Change Password">
                        <FiKey className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedAdmin(admin); setShowUpdateDialog(true); }} className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors" title="Edit">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedAdmin(admin); setShowDeleteDialog(true); }} className="p-1.5 text-red-500 hover:text-red-600 transition-colors" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedAdmins.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No administrators found.</p>
            <AppButton onClick={() => setShowAddDialog(true)}>
              <FiPlus className="w-4 h-4 mr-2" /> Add Administrator
            </AppButton>
          </div>
        )}
      </div>

      <AddAdminDialog isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} onSuccess={() => { showToast('success', 'Administrator created!'); refetch(); }} />
      <UpdateAdminDialog isOpen={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} onSuccess={() => { showToast('success', 'Administrator updated!'); refetch(); }} admin={selectedAdmin} />
      <DeleteAdminDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onSuccess={() => { showToast('success', 'Administrator deleted!'); refetch(); }} admin={selectedAdmin} />
      <ChangeAdminPasswordDialog isOpen={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} onSuccess={() => showToast('success', 'Password updated!')} admin={selectedAdmin} />
    </div>
  );
};

export default AdminsScreen;
