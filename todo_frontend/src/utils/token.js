export const saveToken = (token) => localStorage.setItem('token', token);
export const getToken = () => (typeof window !== "undefined" ? localStorage.getItem('token') : null);
export const removeToken = () => localStorage.removeItem('token');
