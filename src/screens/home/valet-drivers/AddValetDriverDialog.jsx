import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import valetDriver from "../../../graphql/queries/valetDriver";
import parkingLocation from "../../../graphql/queries/parkingLocation";

export const AddValetDriverDialog = ({ isOpen, onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationSearch, setLocationSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const dropdownRef = useRef(null);

    const { data: locationsData } = useQuery(parkingLocation.GET_PARKING_LOCATIONS, {
        variables: {},
        fetchPolicy: 'cache-first',
    });

    const filteredLocations = locationsData?.parking_locations?.filter(l =>
        l.active && (
            l.name?.toLowerCase().includes(locationSearch.toLowerCase()) ||
            l.code?.toLowerCase().includes(locationSearch.toLowerCase())
        )
    ) || [];

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const [createDriver] = useMutation(valetDriver.ADD_VALET_DRIVER, {
        refetchQueries: [{ query: valetDriver.GET_VALET_DRIVERS }],
        onCompleted: (data) => {
            setLoading(false);
            if (!data.response.success) {
                addToast(data.response.message || 'Failed to add cashier.', ToastType.Error);
            } else {
                addToast('Cashier added successfully.', ToastType.Success);
                onSuccess?.();
                handleClose();
            }
        },
        onError: (error) => {
            addToast(error.message || 'Something went wrong.', ToastType.Error);
            setLoading(false);
        }
    });

    const handleClose = () => {
        setForm({ name: '', email: '', phone: '', password: '' });
        setSelectedLocation(null);
        setLocationSearch('');
        setLoading(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.phone || !form.password || !selectedLocation) return;
        setLoading(true);
        await createDriver({
            variables: {
                ...form,
                parkingLocationId: selectedLocation.id,
            }
        });
    };

    const field = (label, key, type = 'text') => (
        <div className="space-y-1">
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

    const isValid = form.name && form.email && form.phone && form.password && selectedLocation;

    return (
        <AppModal isOpen={isOpen} onClose={handleClose} title="Add Cashier">
            <div className="space-y-4">
                {field('Name', 'name')}
                {field('Email', 'email', 'email')}
                {field('Phone', 'phone', 'tel')}
                {field('Password', 'password', 'password')}

                {/* Searchable Parking Location Dropdown */}
                <div className="space-y-1">
                    <p className="text-sm text-[var(--color-text-secondary)]">Parking Location *</p>
                    <div className="relative" ref={dropdownRef}>
                        <input
                            type="text"
                            value={selectedLocation ? `${selectedLocation.name}${selectedLocation.code ? ` (${selectedLocation.code})` : ''}` : locationSearch}
                            onChange={(e) => {
                                setLocationSearch(e.target.value);
                                setSelectedLocation(null);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search parking location..."
                            className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {selectedLocation && (
                            <button
                                onClick={() => { setSelectedLocation(null); setLocationSearch(''); }}
                                className="absolute right-3 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                            >✕</button>
                        )}
                        {showDropdown && !selectedLocation && (
                            <ul className="absolute z-50 w-full mt-1 bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredLocations.length > 0 ? filteredLocations.map(loc => (
                                    <li
                                        key={loc.id}
                                        onMouseDown={() => { setSelectedLocation(loc); setShowDropdown(false); setLocationSearch(''); }}
                                        className="px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer"
                                    >
                                        <span className="font-medium">{loc.name}</span>
                                        {loc.code && <span className="ml-2 text-xs text-[var(--color-text-secondary)]">({loc.code})</span>}
                                        {loc.address && <p className="text-xs text-[var(--color-text-secondary)] truncate">{loc.address}</p>}
                                    </li>
                                )) : (
                                    <li className="px-4 py-2 text-sm text-[var(--color-text-secondary)]">No locations found</li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={handleClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${isValid && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Adding...' : 'Add Cashier'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
