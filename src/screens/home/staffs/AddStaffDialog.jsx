import { useMutation } from "@apollo/client";
import staff from "../../../graphql/queries/staff";
import { useState } from "react";
import { ToastType, useToast } from "../../../context/ToastProvider";
import { AppModal } from "../../../components/AppModal";

export const AddStaffDialog = ({ isOpen, onClose, onAddSuccess }) => {
    const [fullName, setFullName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [addStaff] = useMutation(staff.ADD_STAFF, {
        onCompleted: (data) => {
            if (data.results.error === 1) {
                addToast(data.results.message || 'Something went wrong.', ToastType.Error);
            } else {
                addToast('New POS account added successfully.', ToastType.Success);
                onAddSuccess();
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
            await addStaff({
                variables: {
                    fullName,
                    userName,
                    phone,
                    password
                }
            });
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
            title="Add New POS Account"
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

                {/* Password Input */}
                <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Password
                    </p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
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
                        disabled={!fullName || !userName || !phone || !password || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            fullName && userName && phone && password && !loading
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'
                        }`}
                    >
                        {loading ? 'Adding...' : 'Add POS Account'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};