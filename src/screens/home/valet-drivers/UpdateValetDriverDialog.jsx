import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import valetDriver from "../../../graphql/queries/valetDriver";

const statusOptions = ['AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'INACTIVE', 'SUSPENDED'];

export const UpdateValetDriverDialog = ({ isOpen, onClose, onSuccess, driver }) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', employee_code: '', status: 'AVAILABLE' });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (driver) {
            setForm({
                name: driver.name || '',
                email: driver.email || '',
                phone: driver.phone || '',
                employee_code: driver.employee_code || '',
                status: driver.status || 'AVAILABLE',
            });
        }
    }, [driver]);

    const [updateDriver] = useMutation(valetDriver.UPDATE_VALET_DRIVER, {
        refetchQueries: [{ query: valetDriver.GET_VALET_DRIVERS }],
        onCompleted: () => {
            addToast('Cashier updated successfully.', ToastType.Success);
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
        if (!form.name || !form.email || !form.phone || !form.employee_code) return;
        setLoading(true);
        await updateDriver({ variables: { id: driver.id, ...form } });
    };

    const field = (label, key, type = 'text') => (
        <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );

    const isValid = form.name && form.email && form.phone && form.employee_code;

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Update Cashier">
            <div className="space-y-4">
                {field('Name', 'name')}
                {field('Email', 'email', 'email')}
                {field('Phone', 'phone', 'tel')}
                {field('Employee Code', 'employee_code')}
                <div className="space-y-2 hidden">
                    <p className="text-sm text-[var(--color-text-secondary)]">Status</p>
                    <select
                        value={form.status}
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={onClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${isValid && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Updating...' : 'Update Cashier'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
