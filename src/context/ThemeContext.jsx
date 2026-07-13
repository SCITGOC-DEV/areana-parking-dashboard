// 1. Create Theme Context (src/context/ThemeContext.jsx)
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [isSystem, setIsSystem] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            setIsSystem(false);
            setIsDark(savedTheme === 'dark');
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
        } else {
            setIsDark(systemPrefersDark);
            document.documentElement.classList.toggle('dark', systemPrefersDark);
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (isSystem) {
                setIsDark(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [isSystem]);

    const toggleTheme = (manualDark) => {
        if (typeof manualDark === 'boolean') {
            setIsSystem(false);
            setIsDark(manualDark);
            localStorage.setItem('theme', manualDark ? 'dark' : 'light');
            document.documentElement.classList.toggle('dark', manualDark);
        } else {
            setIsSystem(true);
            localStorage.removeItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemDark);
            document.documentElement.classList.toggle('dark', systemDark);
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, isSystem, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext)