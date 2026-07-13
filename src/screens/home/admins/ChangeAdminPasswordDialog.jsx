import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_ADMIN_PASSWORD } from '../../../graphql/mutation/admin';
import AppButton from '../../../components/AppButton';
import TextField from '../../../components/TextField';
import { AppModal } from '../../../components/AppModal';
import {updateHasuraRole} from "../../../api/apolloClient";

export const ChangeAdminPasswordDialog = ({ isOpen, onClose, onSuccess, admin }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updatePassword] = useMutation(UPDATE_ADMIN_PASSWORD, {
    onCompleted: (data) => {
        console.log('data: ', data);
      const response = data.response;
      if (response.success) {
          setIsSubmitting(false);
          onSuccess?.();
          onClose();
          resetForm();
      } else {
          setIsSubmitting(false)
          setErrors({submit: response.message})
      }
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Error updating password:', error);
      setErrors({ submit: 'Failed to update password. Please try again.' });
    }
  });

  const resetForm = () => {
    setFormData({
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
        updateHasuraRole("dashboard_permission")
      await updatePassword({
        variables: {
          userId: admin.id,
          newPassword: formData.newPassword
        }
      });
    } catch (error) {
      // Error handling is done in onError callback
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!admin) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Change Administrator Password"
      size="md"
    >
      <div className="space-y-6">
        {/* Admin Info */}
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

        {/* Password Fields */}
        <div className="space-y-4">
          <TextField
            label="New Password"
            type="password"
            value={formData.newPassword}
            onChange={(value) => handleInputChange('newPassword', value)}
            error={errors.newPassword}
            placeholder="Enter new password"
            required
          />

          <TextField
            label="Confirm New Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
            required
          />
        </div>

        {/* Password Requirements */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Password Requirements:</strong>
          </p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
            <li>• Minimum 6 characters</li>
            <li>• Use a combination of letters, numbers, and symbols for better security</li>
          </ul>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
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
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Update Password
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
