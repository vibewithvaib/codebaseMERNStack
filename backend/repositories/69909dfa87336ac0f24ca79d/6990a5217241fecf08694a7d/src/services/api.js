import axios from 'axios';

/**
 * A centralized Axios instance for all backend API communication.
 */
const api = axios.create({
    // The base URL of your Spring Boot backend
    baseURL: 'http://localhost:8081/api',
});

/**
 * An Axios interceptor that automatically attaches the JWT authorization header
 * to every outgoing request if a token is available in local storage.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
