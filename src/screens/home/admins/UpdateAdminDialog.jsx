import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_ADMIN } from '../../../graphql/mutation/admin';
import { GET_ADMINS } from '../../../graphql/queries/admin';
import AppButton from '../../../components/AppButton';
import TextField from '../../../components/TextField';
import { AppSwitch } from '../../../components/AppSwitch';
import { AppModal } from '../../../components/AppModal';
import { useAuth } from '../../../context/AuthContext';
import {updateHasuraRole} from "../../../api/apolloClient";

// Permission-related constants removed

export const UpdateAdminDialog = ({ isOpen, onClose, onSuccess, admin }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { logout } = useAuth();

  const [updateAdmin] = useMutation(UPDATE_ADMIN, {
    refetchQueries: [{ query: GET_ADMINS }],
    onCompleted: () => {
      setIsSubmitting(false);
      // Success handling moved to handleSubmit function
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Error updating admin:', error);
      setErrors({ submit: 'Failed to update admin. Please try again.' });
    }
  });
  // Permission-related mutation removed

  useEffect(() => {
    if (admin) {
      setFormData({
        full_name: admin.full_name || '',
        active: admin.active !== undefined ? admin.active : true
      });
      setSuccessMessage(''); // Clear success message when admin changes
      setErrors({}); // Clear errors when admin changes
    }
  }, [admin]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Permission toggle handler removed

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage(''); // Clear success message when submitting

    const updateData = {
      ...formData
      // Don't include permissions here as they're updated separately
    };

    try {
        updateHasuraRole("dashboard_permission")
      await updateAdmin({
        variables: {
          id: admin.id,
          input: updateData
        }
      });
      // Show success message
      setSuccessMessage('Administrator updated successfully.');
      setTimeout(() => {
        setSuccessMessage('');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (error) {
      // Error handling is done in onError callback
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSuccessMessage(''); // Clear success message when closing
      onClose();
    }
  };

  if (!admin) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Administrator"
      size="lg"
    >
      <div className="space-y-8 p-1">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Full Name"
              value={formData.full_name}
              onChange={(value) => handleInputChange('full_name', value)}
              error={errors.full_name}
              placeholder="Enter full name"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/*<div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">*/}
              {/*  <AppSwitch*/}
              {/*    isEnabled={formData.main_admin}*/}
              {/*    handleToggle={() => handleInputChange('main_admin', !formData.main_admin)}*/}
              {/*    disabled={admin.main_admin}*/}
              {/*  />*/}
              {/*  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">*/}
              {/*    Is Main Admin*/}
              {/*  </span>*/}
              {/*</div>*/}

              <div className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <AppSwitch
                  isEnabled={formData.active}
                  handleToggle={() => handleInputChange('active', !formData.active)}
                  disabled={admin.main_admin}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Status
                </span>
              </div>
            </div>
          </div>

          {admin.main_admin && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl shadow-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Main administrator settings cannot be modified
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Permissions section removed */}

        {/* Messages */}
        <div className="space-y-3">
          {errors.submit && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
              <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
              <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <AppButton
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancel
          </AppButton>
          <AppButton
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            className="px-6"
          >
            Update Administrator
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
