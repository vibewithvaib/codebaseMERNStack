import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to home page on logout
    };

    return (
        <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-blue-600">
                    CampusRadar
                </Link>
                <div className="flex items-center space-x-6">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="text-gray-700 font-medium hover:text-blue-600">
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/auth/login" className="text-gray-700 font-medium hover:text-blue-600">
                                Login
                            </Link>
                            <Link to="/auth/register" className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;

