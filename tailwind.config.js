const flowbite = require("flowbite-react/tailwind");
const fadeIn = {
    from: { opacity: 0 },
    to: { opacity: 1 },
};

module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
        flowbite.content(),
    ],
    theme: {
        fontFamily: {
            sans: [
                'Inter Variable',
                'Inter',
                'ui-sans-serif',
                'system-ui',
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Roboto',
                'Helvetica Neue',
                'Arial',
                'sans-serif'
            ],
            mono: [
                'ui-monospace',
                'SFMono-Regular',
                'Menlo',
                'Monaco',
                'Consolas',
                'Liberation Mono',
                'Courier New',
                'monospace'
            ]
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
        },
        extend: {
            keyframes: { fadeIn },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-in-out',
            },
            colors: {
                primary: {
                    light: 'var(--color-primary-light)',
                    DEFAULT: 'var(--color-primary)',
                    dark: 'var(--color-primary-dark)',
                },
                secondary: {
                    light: 'var(--color-secondary-light)',
                    DEFAULT: 'var(--color-secondary)',
                    dark: 'var(--color-secondary-dark)',
                },
            },
        },
    },
    plugins: [
        flowbite.plugin(),
    ],
}