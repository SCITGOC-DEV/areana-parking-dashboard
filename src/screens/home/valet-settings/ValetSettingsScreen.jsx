import { useQuery, useMutation } from "@apollo/client";
import { GET_SETTINGS } from "../../../graphql/queries/settings";
import { UPDATE_SETTING } from "../../../graphql/mutation/settings";
import { AppSwitch } from "../../../components/AppSwitch";
import { Loader } from "../../../components/Loader";
import { ToastType, useToast } from "../../../context/ToastProvider";
import DateUtils from "../../../utils/DateUtils";
import { FiRadio, FiClock, FiSettings, FiAlertTriangle } from "react-icons/fi";

export const ValetSettingsScreen = () => {
    const { addToast } = useToast();

    const { data, loading, error } = useQuery(GET_SETTINGS);

    const [updateSetting, { loading: updating }] = useMutation(UPDATE_SETTING, {
        refetchQueries: ["GetSettings"],
        onCompleted: () => {
            addToast("Valet settings updated successfully.", ToastType.Success);
        },
        onError: (err) => {
            addToast(err.message || "Failed to update settings.", ToastType.Error);
        }
    });

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                <div className="flex items-center gap-3">
                    <FiAlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-800 dark:text-red-200">Error Loading Settings</h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    const settingsList = data?.settings || [];
    const mainSetting = settingsList[0];

    const handleToggle = (checked) => {
        if (!mainSetting) return;
        updateSetting({
            variables: {
                id: mainSetting.id,
                value: checked ? "true" : "false"
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col gap-1 border-b border-[var(--color-secondary-light)] pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-primary-light)] bg-opacity-20 rounded-lg">
                        <FiSettings className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Valet Settings
                    </h2>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    Manage real-time communication protocols, and valet socket transmission variables.
                </p>
            </div>

            {settingsList.length === 0 ? (
                <div className="p-8 text-center bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-secondary-light)]">
                    <p className="text-[var(--color-text-secondary)]">No settings found in the database.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Setting card */}
                    <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-secondary-light)] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 rounded-xl shrink-0">
                                    <FiRadio className="w-6 h-6 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">
                                            Real-Time Updates: (Socket Send To All)
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${mainSetting.value === "true"
                                            ? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-800/60 dark:text-gray-400"
                                            }`}>
                                            {mainSetting.value === "true" ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
                                        When enabled, system notifications, and real-time updates are transmitted to all connected  terminal devices (including P18 Q devices) instantly.
                                    </p>
                                    <div className="text-xs text-[var(--color-text-secondary)] font-mono bg-[var(--color-bg-primary)] px-2 py-1 rounded inline-block border border-[var(--color-secondary-light)] mt-2">
                                        Key: {mainSetting.key}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center self-end sm:self-center">
                                <div className="flex flex-col items-center gap-2">
                                    <AppSwitch
                                        isEnabled={mainSetting.value === "true"}
                                        handleToggle={handleToggle}
                                        disabled={updating}
                                    />
                                    {updating && (
                                        <span className="text-xs text-[var(--color-primary)] font-medium animate-pulse">
                                            Updating...
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Metadata Footer */}
                        <div className="bg-[var(--color-bg-primary)] px-6 py-4 border-t border-[var(--color-secondary-light)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-1.5">
                                <FiClock className="w-3.5 h-3.5" />
                                <span>Created At: {DateUtils.getFormattedDateTime(mainSetting.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FiClock className="w-3.5 h-3.5" />
                                <span>Last Updated: {DateUtils.getFormattedDateTime(mainSetting.updated_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValetSettingsScreen;
