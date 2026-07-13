import { useState } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import driverQueries from "../../../graphql/queries/driver";

export const AddDriverDialog = ({ isOpen, onClose, onAddSuccess }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [addDriver] = useMutation(driverQueries.ADD_DRIVER, {
        refetchQueries: [{ query: driverQueries.GET_DRIVERS }],
        onCompleted: (data) => {
            setLoading(false);
            if (data.insert_drivers_one?.id) {
                addToast('Driver added successfully.', ToastType.Success);
                onAddSuccess?.();
                handleClose();
            } else {
                addToast('Failed to add driver.', ToastType.Error);
            }
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
            setLoading(false);
        }
    });

    const handleClose = () => {
        setFirstName('');
        setLastName('');
        setUserName('');
        setPhone('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!firstName || !lastName || !userName || !phone) return;
        setLoading(true);
        const fullName = `${lastName}, ${firstName}`;
        await addDriver({
            variables: {
                fullName,
                firstName,
                lastName,
                userName,
                phone
            }
        });
    };

    const field = (label, value, setValue, type = 'text') => (
        <div className="space-y-1">
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
        <AppModal isOpen={isOpen} onClose={handleClose} title="Add Driver">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {field('First Name', firstName, setFirstName)}
                    {field('Last Name', lastName, setLastName)}
                </div>
                {field('Username', userName, setUserName)}
                {field('Phone', phone, setPhone, 'tel')}

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={handleClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${isValid && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Adding...' : 'Add Driver'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
