import { TrashIcon } from "lucide-react";
import {AppModal} from "./AppModal"; // Adjust if you're using a different icon

export const DeleteConfirmationDialog = ({
                                       isOpen,
                                       onClose,
                                       onConfirm,
                                       title = "Confirm Action",
                                       message = "Are you sure you want to proceed? This action cannot be undone.",
                                       confirmButtonText = "Confirm",
                                       showIcon = true,
                                   }) => {
    return (
        <AppModal isOpen={isOpen} title={title} onClose={onClose}>
            <div>
                <p className="mb-4 text-[var(--color-text-primary)]">
                    {message}
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-4 px-4 py-2 border border-[var(--color-secondary)] rounded-md shadow-sm text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-secondary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-text-inverse)] bg-[var(--color-error)] hover:bg-[var(--color-error-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-error)] flex items-center"
                    >
                        {showIcon && <TrashIcon size={16} className="mr-2" />}
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
