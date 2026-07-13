export const getToken = async () => localStorage.getItem('token');
export const setAuthToken = async (token) => localStorage.setItem('token', token);
export const removeToken = async () => localStorage.removeItem('token');