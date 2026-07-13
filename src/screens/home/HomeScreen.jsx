export const Home = () => {
    return (
        <div className="p-6 rounded-lg bg-[var(--color-bg-secondary)]">
            <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">
                Dashboard Overview
            </h2>
            {/* Dashboard content */}
        </div>
    );
};

export const AnalyticsScreen = () => (
    <div className="p-6 rounded-lg bg-[var(--color-bg-secondary)]">
        <h2 className="text-2xl font-bold mb-4">Dashboard Content</h2>
    </div>
);

export const SettingsScreen = () => (
    <div className="p-6 rounded-lg bg-[var(--color-bg-secondary)]">
        <h2 className="text-2xl font-bold mb-4">Dashboard Content</h2>
    </div>
);

export const ProfileScreen = () => (
    <div className="p-6 rounded-lg bg-[var(--color-bg-secondary)]">
        <h2 className="text-2xl font-bold mb-4">Dashboard Content</h2>
    </div>
);

export default Home;