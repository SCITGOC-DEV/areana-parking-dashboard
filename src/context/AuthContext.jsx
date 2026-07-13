import { createContext, useContext, useEffect, useState } from 'react';
import {removeToken, getToken, setAuthToken} from '../utils/token';
import {resetHasuraRole, client} from '../api/apolloClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            const initialToken = await getToken(); // Assuming getToken() returns a promise
            console.log('initial token', initialToken);
            setToken(initialToken);
            setAuthChecked(true);
        };
        fetchToken();
    }, []);

    const handleTokenChange = async (newToken) => {
        await setAuthToken(newToken);
        setToken(newToken);
    };

    const logout = async () => {
        await removeToken();
        resetHasuraRole(); // Clear hasura role on logout
        await client.clearStore(); // Clear Apollo cache
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            handleTokenChange,
            logout,
            authChecked
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);