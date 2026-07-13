import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  displayField,
  placeholder = 'Search...',
  label,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = useMemo(
    () =>
      options.filter(
        (option) =>
          option[displayField] &&
          option[displayField].toString().toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [options, searchTerm, displayField]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const getSearchPlaceholder = () => {
    if (label?.toLowerCase().includes('vehicle')) {
      return 'Search vehicle plates...';
    } else if (label?.toLowerCase().includes('machine')) {
      return 'Search serial numbers...';
    }
    return 'Type to search...';
  };

  const getOptionKey = (option, index) => {
    return option.id || option.machine_id || option.vehicle_id || index;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 min-w-[180px] text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-disabled={disabled}
        >
          <span className="block truncate text-gray-900 dark:text-gray-100">
            {value && value[displayField] ? value[displayField] : placeholder}
          </span>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
            role="listbox"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-750">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const isSelected = value && value[displayField] === option[displayField];
                  return (
                    <button
                      key={getOptionKey(option, index)}
                      onClick={() => handleSelect(option)}
                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 dark:bg-gray-700' : ''
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {option[displayField]}
                        </div>
                        {option.id && option[displayField] !== 'All' && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            ID: {option.id}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-blue-500 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <Search className="h-8 w-8 mx-auto opacity-50" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No results found
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Try adjusting your search
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};