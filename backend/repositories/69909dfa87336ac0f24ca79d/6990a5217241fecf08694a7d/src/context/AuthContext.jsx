import React, { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                console.log(decodedUser)
                // Check if the token is expired before setting the user
                if (decodedUser.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                } else {
                    setUser({ ...decodedUser, token });
                }
            } catch (error) {
                console.error("Invalid token found in local storage:", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        const decodedUser = jwtDecode(token);
        localStorage.setItem('token', token);
        setUser({ ...decodedUser, token });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* We wait until the initial loading is done before rendering the app */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

