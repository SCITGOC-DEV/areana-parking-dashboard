import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({
  label = "Select Option",
  options = [],
  value,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full inline-flex justify-between items-center px-3 py-3
            text-sm font-medium rounded-md
            bg-white dark:bg-gray-800
            text-gray-700 dark:text-gray-200
            border border-gray-300 dark:border-gray-600
            hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-blue-500 dark:focus:ring-blue-400
            transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : 'Select an option'}
          </span>
          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="
            absolute z-10 mt-1 w-full rounded-md
            bg-white dark:bg-gray-800
            shadow-lg ring-1
            ring-gray-300 dark:ring-gray-600
            ring-opacity-5
          ">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="
                    w-full text-left px-4 py-2 text-sm
                    text-gray-700 dark:text-gray-200
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    hover:text-gray-900 dark:hover:text-white
                    focus:outline-none
                    focus:bg-gray-100 dark:focus:bg-gray-700
                    focus:text-gray-900 dark:focus:text-white
                    transition-colors
                  "
                  role="menuitem"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
