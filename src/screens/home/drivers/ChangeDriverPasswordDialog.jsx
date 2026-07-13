import { useState } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import driverQueries from "../../../graphql/queries/driver";

export const ChangeDriverPasswordDialog = ({ isOpen, onClose, onSuccess, driverId }) => {
    const [password, setPassword] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [resetPassword] = useMutation(driverQueries.UPDATE_DRIVER_PASSWORD, {
        onCompleted: (data) => {
            setLoading(false);
            if (data.response.error === 1) {
                addToast(data.response.message || 'Failed to change password.', ToastType.Error);
            } else {
                addToast("Password changed successfully", ToastType.Success);
                onSuccess?.();
                handleClose();
            }
        },
        onError: () => {
            addToast("Failed to change password", ToastType.Error);
            setLoading(false);
        },
    });

    const handleSubmit = async () => {
        if (!password) return;
        setLoading(true);
        await resetPassword({
            variables: {
                userId: driverId,
                newPassword: password,
                note: note || "Reset by administrator"
            }
        });
    };

    const handleClose = () => {
        setPassword("");
        setNote("");
        onClose();
    };

    return (
        <AppModal isOpen={isOpen} onClose={handleClose} title="Change Password">
            <div className="space-y-6">
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">New Password</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">Note</p>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter note..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={handleClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!password || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${password && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? "Changing..." : "Change Password"}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
