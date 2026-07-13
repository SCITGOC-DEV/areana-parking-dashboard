import PropTypes from 'prop-types';

export const Dialog = ({
                           isOpen,
                           onClose,
                           onConfirm,
                           title,
                           message,
                           confirmText,
                           cancelText,
                           confirmColor = 'bg-red-500',
                       }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                {/* Dialog Header */}
                {title && (
                    <h3 className="text-xl font-semibold mb-4 text-[var(--color-text-primary)]">
                        {title}
                    </h3>
                )}

                {/* Dialog Body */}
                {message && (
                    <p className="mb-6 text-[var(--color-text-secondary)]">
                        {message}
                    </p>
                )}

                {/* Dialog Footer */}
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                    >
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity ${confirmColor}`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

Dialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    confirmColor: PropTypes.string,
};