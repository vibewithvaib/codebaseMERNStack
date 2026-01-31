import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';

/**
 * The Login page component.
 * It handles the user sign-in process and authentication state.
 */
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Call the backend sign-in API
            const response = await api.post('/auth/signin', { email, password });
            if (response.data && response.data.token) {
                // If successful, update the auth context and navigate to the dashboard
                login(response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password. Please ensure your account has been approved by an admin.');
            console.error('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-6">Login to CampusRadar</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p className="mt-6 text-sm text-center">
                Don't have an account? <Link to="/auth/register" className="text-blue-600 hover:underline">Register here</Link>
            </p>
        </Card>
    );
};

export default LoginPage;

