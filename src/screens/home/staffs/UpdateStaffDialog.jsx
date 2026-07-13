import staff from "../../../graphql/queries/staff";
import { useMutation } from "@apollo/client";
import { useToast } from "../../../context/ToastProvider";
import { ToastType } from "../../../context/ToastProvider";
import { useState } from "react";
import { AppModal } from "../../../components/AppModal";
import { useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
export const UpdateStaffDialog = ({ isOpen, onClose, onUpdateSuccess, staffId }) => {
    const [fullName, setFullName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [getStaffById] = useLazyQuery(staff.GET_STAFF_BY_ID, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            setFullName(data.results.full_name);
            setUserName(data.results.user_name);
            setPhone(data.results.phone);
        }
    });

    useEffect(() => {
        if (staffId !== null) getStaffById({ variables: { id: staffId } });
    }, [staffId]);

    const [updateStaff] = useMutation(staff.UPDATE_STAFF, {
        onCompleted: (data) => {
            if (data.results.error === 1) {
                addToast(data.results.message || 'Something went wrong.', ToastType.Error);
            } else {
                addToast('POS account updated successfully.', ToastType.Success);
                onUpdateSuccess();
                onClose();
            }
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
        }
    });

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await updateStaff({
                variables: {
                    id: staffId,
                    fullName,
                    userName,
                    phone,
                    updatedAt: new Date()
                }
            });
            onUpdateSuccess();
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form fields
        setFullName('');
        setUserName('');
        setPhone('');
        setPassword('');
        onClose();
    };

    return (
        <AppModal
            isOpen={isOpen}
            onClose={handleCancel}
            title="Update POS Account"
        >
            <div className="space-y-6">
                {/* Full Name Input */}
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Full Name
                    </p>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter POS account's full name..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Username
                    </p>
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter username..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Phone Number
                    </p>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!fullName || !userName || !phone || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            fullName && userName && phone && !loading
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Updating...' : 'Update POS Account'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
}
