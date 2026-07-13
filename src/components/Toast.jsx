import {useEffect, useState} from "react";
import {FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX} from "react-icons/fi";

export const Toast = ({ message, type, onClose }) => {
    const typeStyles = {
        success: {
            bg: 'bg-[var(--color-success)]',
            border: 'border-[var(--color-success-dark)]',
            icon: <FiCheckCircle className="w-6 h-6" />
        },
        error: {
            bg: 'bg-[var(--color-error)]',
            border: 'border-[var(--color-error-dark)]',
            icon: <FiAlertCircle className="w-6 h-6" />
        },
        warning: {
            bg: 'bg-[var(--color-warning)]',
            border: 'border-[var(--color-warning-dark)]',
            icon: <FiAlertTriangle className="w-6 h-6" />
        },
        info: {
            bg: 'bg-[var(--color-info)]',
            border: 'border-[var(--color-info-dark)]',
            icon: <FiInfo className="w-6 h-6" />
        },
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000); // Increased duration for dialog-style
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`
            ${typeStyles[type].bg}
            ${typeStyles[type].border}
            text-[var(--color-text-inverse)]
            rounded-xl shadow-2xl p-6 min-w-[400px] max-w-[500px]
            flex items-start gap-4
            transition-all duration-300
            border-2
            translate-y-0 opacity-100
            hover:translate-y-[-4px] hover:shadow-3xl
            backdrop-blur-md
            relative
            toast-entering
            dialog-style
        `}>
            {/* Icon */}
            <div className="shrink-0 mt-1">
                {typeStyles[type].icon}
            </div>

            {/* Content */}
            <div className="flex-1">
                {/* Message */}
                <div className="text-base font-medium leading-relaxed mb-3">
                    {message}
                </div>

                {/* Optional actions area */}
                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="
                            px-4 py-2 text-sm font-medium
                            bg-[rgba(255,255,255,0.15)]
                            hover:bg-[rgba(255,255,255,0.25)]
                            rounded-lg transition-all duration-200
                            border border-[rgba(255,255,255,0.2)]
                            hover:border-[rgba(255,255,255,0.3)]
                        "
                    >
                        Dismiss
                    </button>
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="
                    -mt-2 -mr-2 p-2
                    hover:bg-[rgba(255,255,255,0.15)]
                    rounded-full transition-colors duration-200
                    group
                "
            >
                <FiX className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};
