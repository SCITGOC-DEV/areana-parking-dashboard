import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { AppModal } from "../../../components/AppModal";
import { ToastType, useToast } from "../../../context/ToastProvider";
import valetDriver from "../../../graphql/queries/valetDriver";
import parkingLocation from "../../../graphql/queries/parkingLocation";
import { FiMapPin } from "react-icons/fi";

export const ChangeValetDriverLocationDialog = ({ isOpen, onClose, onSuccess, driver }) => {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locationSearch, setLocationSearch] = useState('');
    const [note, setNote] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const dropdownRef = useRef(null);

    const { data: locationsData } = useQuery(parkingLocation.GET_PARKING_LOCATIONS, {
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
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const [changeLocation] = useMutation(valetDriver.CHANGE_VALET_DRIVER_PARKING_LOCATION, {
        refetchQueries: [{ query: valetDriver.GET_VALET_DRIVERS }],
        onCompleted: (data) => {
            setLoading(false);
            if (!data.response.success) {
                addToast(data.response.message || 'Failed to change location.', ToastType.Error);
            } else {
                addToast('Parking location changed successfully.', ToastType.Success);
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
        setSelectedLocation(null);
        setLocationSearch('');
        setNote('');
        setLoading(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedLocation || !driver) return;
        setLoading(true);
        await changeLocation({
            variables: {
                driverId: driver.id,
                parkingLocationId: selectedLocation.id,
                note: note || null,
            }
        });
    };

    return (
        <AppModal isOpen={isOpen} onClose={handleClose} title="Change Parking Location">
            <div className="space-y-4">
                {/* Current driver info */}
                {driver && (
                    <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3">
                        <p className="text-xs text-[var(--color-text-secondary)]">Driver</p>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">{driver.name}</p>
                        {driver.valet_driver_parking_locations?.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-[var(--color-text-secondary)]">Current Location(s)</p>
                                {driver.valet_driver_parking_locations.map(l => (
                                    <div key={l.id} className="flex items-center gap-1 mt-1">
                                        <FiMapPin className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs text-[var(--color-text-primary)]">{l.parking_location?.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Searchable location dropdown */}
                <div className="space-y-1">
                    <p className="text-sm text-[var(--color-text-secondary)]">New Parking Location *</p>
                    <div className="relative" ref={dropdownRef}>
                        <input
                            type="text"
                            value={selectedLocation ? `${selectedLocation.name}${selectedLocation.code ? ` (${selectedLocation.code})` : ''}` : locationSearch}
                            onChange={(e) => { setLocationSearch(e.target.value); setSelectedLocation(null); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search parking location..."
                            className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {selectedLocation && (
                            <button onClick={() => { setSelectedLocation(null); setLocationSearch(''); }} className="absolute right-3 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">✕</button>
                        )}
                        {showDropdown && !selectedLocation && (
                            <ul className="absolute z-50 w-full mt-1 bg-[var(--color-bg-primary)] border border-[var(--color-bg-secondary)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {filteredLocations.length > 0 ? filteredLocations.map(loc => (
                                    <li key={loc.id} onMouseDown={() => { setSelectedLocation(loc); setShowDropdown(false); setLocationSearch(''); }}
                                        className="px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer">
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

                {/* Note */}
                <div className="space-y-1">
                    <p className="text-sm text-[var(--color-text-secondary)]">Note (optional)</p>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter note..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button onClick={handleClose} className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedLocation || loading}
                        className={`px-4 py-2 rounded-lg transition-colors ${selectedLocation && !loading ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'}`}
                    >
                        {loading ? 'Changing...' : 'Change Location'}
                    </button>
                </div>
            </div>
        </AppModal>
    );
};
