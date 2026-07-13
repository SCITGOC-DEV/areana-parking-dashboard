import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ADMIN } from '../../../graphql/mutation/admin';
import { GET_ADMINS } from '../../../graphql/queries/admin';
import AppButton from '../../../components/AppButton';
import TextField from '../../../components/TextField';
import { Dropdown } from '../../../components/Dropdown';
import { AppModal } from '../../../components/AppModal';
import {useToast} from "../../../context/ToastProvider";

const adminCategories = [
  { value: 'main', label: 'Main Admin' },
  { value: 'sub', label: 'Sub Admin' },
  { value: 'supervisor', label: 'Supervisor' }
];

export const AddAdminDialog = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    password: '',
    phone: '',
    adminCategory: 'sub'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [createAdmin] = useMutation(CREATE_ADMIN, {
    refetchQueries: [{ query: GET_ADMINS }],
    onCompleted: (data) => {
      setIsSubmitting(false);
      if (!data.response.success) {
        setErrors({ submit: data.response.message || 'Failed to create admin.' });
      } else {
        onSuccess?.();
        onClose();
        resetForm();
      }
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error('Error creating admin:', error);
      setErrors({ submit: error.message || 'Failed to create admin. Please try again.' });
    }
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      userName: '',
      email: '',
      password: '',
      phone: '',
      adminCategory: 'super_admin'
    });
    setErrors({});
    setShowPassword(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createAdmin({
        variables: {
          userName: formData.userName,
          email: formData.email,
          fullName: formData.fullName,
          password: formData.password,
          phone: formData.phone,
          adminCategory: formData.adminCategory,
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

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const strengthMap = {
      0: { label: '', color: '', width: '0%' },
      1: { label: 'Very Weak', color: 'bg-red-500', width: '20%' },
      2: { label: 'Weak', color: 'bg-orange-500', width: '40%' },
      3: { label: 'Fair', color: 'bg-yellow-500', width: '60%' },
      4: { label: 'Good', color: 'bg-blue-500', width: '80%' },
      5: { label: 'Strong', color: 'bg-green-500', width: '100%' }
    };

    return strengthMap[strength];
  };

  const passwordStrength = getPasswordStrength();

  return (
      <AppModal
          isOpen={isOpen}
          onClose={handleClose}
          title="Add New Administrator"
          size="lg"
          className="max-w-2xl"
      >
        <div className="space-y-8">
          {/* Header with Icon */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create New Administrator
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add a new administrator to manage the system
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <TextField
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(value) => handleInputChange('fullName', value)}
                      error={errors.fullName}
                      placeholder="Enter full name"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <TextField
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      error={errors.email}
                      placeholder="Enter email address"
                      required
                  />
                </div>

                <div className="space-y-2">
                  <TextField
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(value) => handleInputChange('phone', value)}
                      error={errors.phone}
                      placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2M7 7a2 2 0 012 2m0 0a2 2 0 012 2M9 9a2 2 0 00-2 2m2-2V7a2 2 0 012-2m0 0V3a2 2 0 012-2h4a2 2 0 012 2v2M9 21h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Account Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <TextField
                      label="Username"
                      value={formData.userName}
                      onChange={(value) => handleInputChange('userName', value)}
                      error={errors.userName}
                      placeholder="Enter username"
                      required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Only letters, numbers, and underscores allowed
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(value) => handleInputChange('password', value)}
                        error={errors.password}
                        placeholder="Enter secure password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                      ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Password strength</span>
                          <span className={`text-xs font-medium ${
                              passwordStrength.label === 'Strong' ? 'text-green-600 dark:text-green-400' :
                                  passwordStrength.label === 'Good' ? 'text-blue-600 dark:text-blue-400' :
                                      passwordStrength.label === 'Fair' ? 'text-yellow-600 dark:text-yellow-400' :
                                          'text-red-600 dark:text-red-400'
                          }`}>
                        {passwordStrength.label}
                      </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                              className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: passwordStrength.width }}
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Permissions Section */}
            {/*<div className="space-y-4">*/}
            {/*  <div className="flex items-center space-x-2">*/}
            {/*    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">*/}
            {/*      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
            {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />*/}
            {/*      </svg>*/}
            {/*    </div>*/}
            {/*    <h3 className="text-lg font-medium text-gray-900 dark:text-white">*/}
            {/*      Role & Permissions*/}
            {/*    </h3>*/}
            {/*  </div>*/}

            {/*  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
            {/*    <Dropdown*/}
            {/*        label="Admin Category"*/}
            {/*        value={formData.adminCategory}*/}
            {/*        onChange={(value) => handleInputChange('adminCategory', value)}*/}
            {/*        options={adminCategories}*/}
            {/*        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"*/}
            {/*    />*/}
            {/*    <div className="flex items-center justify-center">*/}
            {/*      <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">*/}
            {/*        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
            {/*          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />*/}
            {/*        </svg>*/}
            {/*        <p className="text-sm text-gray-500 dark:text-gray-400">*/}
            {/*          Permissions will be set based on selected category*/}
            {/*        </p>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>

          {/* Error Message with Enhanced Styling */}
          {errors.submit && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{errors.submit}</p>
                </div>
              </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <AppButton
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </AppButton>
            <AppButton
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating...</span>
                  </div>
              ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Administrator</span>
                  </div>
              )}
            </AppButton>
          </div>
        </div>
      </AppModal>
  );
};
