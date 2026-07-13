import {useEffect, useState} from "react"
import { AppModal } from "./AppModal"

export const BusReorderDialog = ({isOpen, onClose, onSubmit}) => {
    const [newOrder, setNewOrder] = useState(0)

    useEffect(() => {
        setNewOrder(0)
    }, [isOpen]);

    return (
        <AppModal isOpen={isOpen} onClose={onClose} title="Reorder Bus Stops">
            <div className="space-y-2">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        Bus Stop Name
                    </p>
                    <input
                        type="number"
                        value={newOrder}
                        onChange={(e) => setNewOrder(e.target.value)}
                        placeholder="Enter new order..."
                        className="w-full px-4 py-2 border border-[var(--color-bg-secondary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-bg-secondary)]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(newOrder)}
                        disabled={!newOrder}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            newOrder
                                ? 'bg-primary text-white hover:bg-primary-dark'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] cursor-not-allowed'
                        }`}
                    >
                        {'Reorder'}
                    </button>
                </div>
        </AppModal>
    )
}