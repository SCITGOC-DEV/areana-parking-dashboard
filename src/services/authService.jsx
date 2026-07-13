export const loginUser = async (credentials) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const validateToken = async (token) => {
    try {
        const response = await fetch('/api/validate-token', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};