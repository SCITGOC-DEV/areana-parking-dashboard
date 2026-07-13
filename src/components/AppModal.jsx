import {useEffect, useState} from "react";


export const AppModal = ({
                             isOpen,
                             onClose,
                             children,
                             maxWidth = 'max-w-3xl',
                             size = 'md',
                             title = null,
                             description = null,
                             showCloseButton = true
                         }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Trigger enter transition after mount
            requestAnimationFrame(() => {
                setIsMounted(true);
            });
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsMounted(false);
        // Wait for animation to complete before unmounting
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div
            className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black transition-opacity duration-300 ease-out
        ${isMounted ? 'bg-opacity-50' : 'bg-opacity-0'}
      `}
        >
            <div
                className={`
          transform transition-all duration-300 ease-out
          ${isMounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          bg-[var(--color-bg-primary)] rounded-xl p-6 w-full ${
            size === 'sm' ? 'max-w-md' : 
            size === 'md' ? 'max-w-lg' : 
            size === 'lg' ? 'max-w-2xl' : 
            size === 'xl' ? 'max-w-4xl' : 
            maxWidth
          }
          max-h-[90vh] overflow-y-auto shadow-xl
        `}
            >
                {/* Modal Header */}
                {(title || showCloseButton) && (
                    <div className="mb-6">
                        <div className="flex justify-between items-start">
                            {title && (
                                <div>
                                    {typeof title === "string" ? (
                                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                                            {title}
                                        </h2>
                                    ) : (
                                        title
                                    )}
                                </div>
                            )}

                            {showCloseButton && (
                                <button
                                    onClick={handleClose}
                                    className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6 text-[var(--color-text-secondary)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {description && (
                            <label className="text-lg text-[var(--color-text-secondary)]">
                                {description}
                            </label>
                        )}
                    </div>
                )}


                {/* Modal Content */}
                {children}
            </div>
        </div>
    );
};