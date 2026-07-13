import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import driverQueries from "../../../graphql/queries/driver";

export const UpdateDriverDialog = ({ isOpen, onClose, onSuccess, driver }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (driver) {
            setFirstName(driver.first_name || '');
            setLastName(driver.last_name || '');
            setUserName(driver.user_name || '');
            setPhone(driver.phone || '');
        }
    }, [driver]);

    const [updateDriver] = useMutation(driverQueries.UPDATE_DRIVER, {
        refetchQueries: [{ query: driverQueries.GET_DRIVERS }],
        onCompleted: () => {
            addToast('Driver updated successfully.', ToastType.Success);
            onSuccess?.();
            onClose();
            setLoading(false);
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
            setLoading(false);
        }
    });

    const handleSubmit = async () => {
        if (!firstName || !lastName || !userName || !phone) return;
        setLoading(true);
        const fullName = `${lastName}, ${firstName}`;
        await updateDriver({
            variables: {
                id: driver.id,
                fullName,
                firstName,
                lastName,
                phone,
                userName,
                updatedAt: new Date().toISOString()
            }
        });
    };

    const field = (label, value, setValue, type = 'text') => (
        <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
            <input
                type={type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );

    const isValid = firstName && lastName && userName && phone;

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Update Driver">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {field('First Name', firstName, setFirstName)}
                    {field('Last Name', lastName, setLastName)}
                </div>
                {field('Username', userName, setUserName)}
                {field('Phone', phone, setPhone, 'tel')}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={onClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${isValid && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Updating...' : 'Update Driver'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
