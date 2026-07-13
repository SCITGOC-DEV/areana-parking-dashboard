import { useState } from "react";
import { useMutation } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import parkingLocation from "../../../graphql/queries/parkingLocation";

export const AddParkingLocationDialog = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', code: '', address: '', latitude: '', longitude: '', description: '' });
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const [add] = useMutation(parkingLocation.ADD_PARKING_LOCATION, {
        refetchQueries: [{ query: parkingLocation.GET_PARKING_LOCATIONS }],
        onCompleted: () => {
            addToast('Parking location added successfully.', ToastType.Success);
            onSuccess?.();
            handleClose();
            setLoading(false);
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
            setLoading(false);
        }
    });

    const handleClose = () => {
        setForm({ name: '', code: '', address: '', latitude: '', longitude: '', description: '' });
        setLoading(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!form.name) return;
        setLoading(true);
        await add({
            variables: {
                name: form.name,
                code: form.code || null,
                address: form.address || null,
                latitude: form.latitude ? parseFloat(form.latitude) : null,
                longitude: form.longitude ? parseFloat(form.longitude) : null,
                description: form.description || null,
            }
        });
    };

    const field = (label, key, type = 'text', required = false) => (
        <div className="space-y-1">
            <p className="text-sm text-[var(--color-text-secondary)]">{label}{required && ' *'}</p>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );

    return (
        <AppModal isOpen={isOpen} onClose={handleClose} title="Add Parking Location">
            <div className="space-y-4">
                {field('Name', 'name', 'text', true)}
                {field('Code', 'code')}
                {field('Address', 'address')}
                <div className="grid grid-cols-2 gap-3">
                    {field('Latitude', 'latitude', 'number')}
                    {field('Longitude', 'longitude', 'number')}
                </div>
                <div className="space-y-1">
                    <p className="text-sm text-[var(--color-text-secondary)]">Description</p>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description..."
                        rows={3}
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={handleClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!form.name || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${form.name && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Adding...' : 'Add Location'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
