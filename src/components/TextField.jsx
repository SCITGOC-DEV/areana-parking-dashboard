import PropTypes from 'prop-types';
import { useState, forwardRef, useId } from 'react';

const TextField = forwardRef(({
                                  value,
                                  placeholder,
                                  onChange,
                                  label,
                                  type = 'text',
                                  error,
                                  required = false,
                                  disabled = false,
                                  size = 'md',
                                  variant = 'default',
                                  leftIcon,
                                  rightIcon,
                                  helperText,
                                  maxLength,
                                  autoComplete,
                                  ...props
                              }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const id = useId();
    const inputId = props.id || id;

    const sizeClasses = {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-3 text-sm',
        lg: 'px-4 py-4 text-base'
    };

    const getInputClasses = () => {
        const baseClasses = `
            w-full rounded-lg border transition-all duration-200 
            focus:outline-none focus:ring-2 placeholder-gray-400
            dark:placeholder-gray-500 disabled:cursor-not-allowed
            disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800
            ${sizeClasses[size]}
        `;

        const variantClasses = {
            default: `
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                ${error
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                : isFocused
                    ? 'border-blue-500 focus:ring-blue-500/20 focus:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            `,
            filled: `
                bg-gray-50 dark:bg-gray-800 border-transparent text-gray-900 dark:text-white
                ${error
                ? 'bg-red-50 dark:bg-red-900/20 focus:ring-red-500/20 focus:bg-white dark:focus:bg-gray-900'
                : 'focus:bg-white dark:focus:bg-gray-900 focus:ring-blue-500/20 hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            `,
            outlined: `
                bg-transparent border-2 text-gray-900 dark:text-white
                ${error
                ? 'border-red-500 focus:ring-red-500/10'
                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/10'
            }
            `
        };

        return `${baseClasses} ${variantClasses[variant]}`;
    };

    const getLabelClasses = () => {
        return `
            block text-sm font-medium mb-2 transition-colors duration-200
            ${error
            ? 'text-red-700 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
        }
            ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}
        `;
    };

    return (
        <div className="w-full space-y-1 dark:bg-transparent">
            {label && (
                <label htmlFor={inputId} className={getLabelClasses()}>
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className={`text-gray-400 dark:text-gray-500 ${error ? 'text-red-400' : ''}`}>
                            {leftIcon}
                        </div>
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    autoComplete={autoComplete}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                        error ? `${inputId}-error` :
                            helperText ? `${inputId}-helper` : undefined
                    }
                    className={`
                        ${getInputClasses()}
                        ${leftIcon ? 'pl-10' : ''}
                        ${rightIcon ? 'pr-10' : ''}
                    `}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className={`text-gray-400 dark:text-gray-500 ${error ? 'text-red-400' : ''}`}>
                            {rightIcon}
                        </div>
                    </div>
                )}

                {maxLength && (
                    <div className="absolute right-3 bottom-1 text-xs text-gray-400 dark:text-gray-500">
                        {value.length}/{maxLength}
                    </div>
                )}

                {isFocused && !error && (
                    <div className="absolute inset-0 rounded-lg bg-blue-500/5 dark:bg-blue-400/5 pointer-events-none animate-pulse" />
                )}
            </div>

            {helperText && !error && (
                <p id={`${inputId}-helper`} className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{helperText}</span>
                </p>
            )}

            {error && (
                <div id={`${inputId}-error`} className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="animate-fade-in">{error}</span>
                </div>
            )}

            {!error && value && required && (
                <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Looks good!</span>
                </div>
            )}
        </div>
    );
});

TextField.displayName = 'TextField';

TextField.propTypes = {
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'search']),
    error: PropTypes.string,
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    variant: PropTypes.oneOf(['default', 'filled', 'outlined']),
    leftIcon: PropTypes.node,
    rightIcon: PropTypes.node,
    helperText: PropTypes.string,
    maxLength: PropTypes.number,
    autoComplete: PropTypes.string,
    id: PropTypes.string,
};

export default TextField;
