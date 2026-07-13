import React from 'react';

const AppButton = ({
                           loading,
                           children,
                           className = '',
                           type = 'submit',
                           variant = 'primary',
                           ...props
                       }) => {
    return (
        <button
            type={type}
            disabled={loading}
            aria-disabled={loading}
            className={`font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 text-sm sm:text-base relative ${
                loading
                    ? 'cursor-not-allowed'
                    : ''
            } ${
                variant === 'primary' 
                    ? `w-full text-white focus:ring-blue-500 ${
                        loading
                            ? 'bg-blue-700 dark:bg-blue-800'
                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                    }`
                    : variant === 'secondary'
                    ? `text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500`
                    : variant === 'danger'
                    ? `text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 focus:ring-red-500`
                    : `w-full text-white focus:ring-blue-500 ${
                        loading
                            ? 'bg-blue-700 dark:bg-blue-800'
                            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600'
                    }`
            } ${className}`}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>Processing...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default AppButton;