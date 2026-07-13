import { useState } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import valetDriver from "../../../graphql/queries/valetDriver";

export const DeleteValetDriverDialog = ({ isOpen, onClose, onSuccess, driver }) => {
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [deleteDriver] = useMutation(valetDriver.DELETE_VALET_DRIVER, {
        refetchQueries: [{ query: valetDriver.GET_VALET_DRIVERS }],
        onCompleted: () => {
            addToast('Cashier deleted successfully.', ToastType.Success);
            onSuccess?.();
            onClose();
            setLoading(false);
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
            setLoading(false);
        }
    });

    const handleDelete = async () => {
        setLoading(true);
        await deleteDriver({ variables: { id: driver.id } });
    };

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Delete Cashier">
            <div className="space-y-6">
                <p className="text-[var(--color-text-primary)]">
                    Are you sure you want to delete <span className="font-semibold">{driver?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={onClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
