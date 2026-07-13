import React, {useEffect, useState} from 'react';

export const AppDatePicker = ({ defaultDate, value, onChange, label = "Date of Birth*" }) => {
    // Use props if provided, otherwise use internal state
    const [internalDob, setInternalDob] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Initialize with defaultDate if provided
    useEffect(() => {
        if (defaultDate && !internalDob && value === undefined) {
            const dateValue = new Date(defaultDate);
            if (!isNaN(dateValue.getTime())) {
                setInternalDob(dateValue.toISOString());
            }
        }
    }, [defaultDate, internalDob, value]);

    // Use either the prop or internal state
    const dob = value !== undefined ? value : internalDob;
    const handleChange = (newDate) => {
        if (onChange) {
            onChange(newDate);
        } else {
            setInternalDob(newDate);
        }
        setIsOpen(false);
    };

    // Calculate min and max dates (e.g., 100 years ago to today)
    const today = new Date();
    const maxDate = today.toISOString().split('T')[0];
    const minYear = today.getFullYear() - 100;
    const minDate = new Date(minYear, 0, 1).toISOString().split('T')[0];

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
                <span className="ml-1 text-xs text-gray-500">(Required)</span>
            </label>

            <div className="relative">
                {/* Display field with formatted date */}
                <div
                    onClick={() => setIsOpen(true)}
                    className="w-full px-4 py-3 flex items-center justify-between border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-gray-700 cursor-pointer hover:border-gray-400 transition-colors"
                >
          <span className={"text-[var(--color-text-primary)]"}>
            {dob ? formatDate(dob) : "Select date"}
          </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                </div>

                {/* Actual date input (hidden but accessible) */}
                <input
                    type="date"
                    value={dob ? dob.split('T')[0] : ''}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => {
                        if (e.target.value) {
                            handleChange(new Date(e.target.value).toISOString());
                        } else {
                            handleChange('');
                        }
                    }}
                    onClick={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                    className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${isOpen ? 'z-10' : '-z-10'}`}
                    aria-label="Date selection"
                />
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-500">
                Please enter your date ({minDate.split('-')[0]} - {maxDate.split('-')[0]})
            </p>
        </div>
    );
};
