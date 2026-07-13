import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_ADMIN } from '../../../graphql/mutation/admin';
import { GET_ADMINS } from '../../../graphql/queries/admin';
import AppButton from '../../../components/AppButton';
import { AppModal } from '../../../components/AppModal';
import {updateHasuraRole} from "../../../api/apolloClient";

export const DeleteAdminDialog = ({ isOpen, onClose, onSuccess, admin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [deleteAdmin] = useMutation(DELETE_ADMIN, {
    refetchQueries: [{ query: GET_ADMINS }],
    onCompleted: () => {
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Error deleting admin:', error);
      setError('Failed to delete admin. Please try again.');
    }
  });

  const handleDelete = async () => {
    if (!admin) return;

    setIsSubmitting(true);
    setError('');

    try {
        updateHasuraRole("dashboard_permission")
      await deleteAdmin({
        variables: {
          id: admin.id
        }
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      onClose();
    }
  };

  if (!admin) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Administrator"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Are you sure you want to delete this administrator?
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone. The administrator <strong>{admin.full_name}</strong> will be permanently removed from the system.
          </p>
        </div>

        {/* Admin Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {admin.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {admin.full_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {admin.admin_category} Admin
              </p>
            </div>
          </div>
        </div>

        {/* Special Warning for Main Admin */}
        {admin.main_admin && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300 text-center">
              <strong>Warning:</strong> This is a main administrator. Deleting this account may affect system functionality.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <AppButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </AppButton>
          <AppButton
            variant="danger"
            onClick={handleDelete}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Delete Administrator
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
