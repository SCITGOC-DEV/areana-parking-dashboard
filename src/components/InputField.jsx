export const InputField = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder = '',
    disabled = false,
    icon = null,
    required = false,
    error = '',
    helperText = ''
  }) => {
    return (
      <div className="group">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 ${
              error 
                ? 'border-red-500 dark:border-red-400' 
                : 'border-gray-200 dark:border-gray-700'
            } rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none ${
              error 
                ? 'focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-500/10' 
                : 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10'
            } disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pr-12' : ''}`}
          />
          {icon && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  };