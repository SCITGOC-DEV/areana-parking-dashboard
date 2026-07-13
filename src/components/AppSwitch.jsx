import { useEffect, useState } from "react";

export const AppSwitch = ({ isEnabled, handleToggle, disabled = false }) => {
    const [active, setActive] = useState(false);

    useEffect(() => {
        setActive(isEnabled);
    }, [isEnabled]);

    const toggleSwitch = (e) => {
        if (disabled) return;
        e.stopPropagation();
        setActive((prev) => !prev);
        handleToggle(!active);
    };

    return (
        <div className="inline-flex items-center" onClick={(e) => e.stopPropagation()}>
            <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`} onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={active}
                    onChange={toggleSwitch}
                    onClick={(e) => e.stopPropagation()}
                    disabled={disabled}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
        </div>
    );
};