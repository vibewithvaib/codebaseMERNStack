import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';

/**
 * The Registration page component.
 * It handles the user sign-up process for both Students and Recruiters.
 */
const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        role: 'STUDENT',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        rollNumber: '',
        companyName: '',
        workEmail: '',
        linkedInProfile: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            // Construct the payload with only the necessary data for the selected role
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };

            if (formData.role === 'STUDENT') {
                payload.rollNumber = formData.rollNumber;
            } else { // RECRUITER
                payload.companyName = formData.companyName;
                payload.workEmail = formData.workEmail;
                payload.linkedInProfile = formData.linkedInProfile;
            }

            // Call the backend sign-up API
            await api.post('/auth/signup', payload);
            
            setMessage('Registration successful! Please wait for an admin to approve your account before you can log in.');
            // Redirect to login page after a delay
            setTimeout(() => navigate('/auth/login'), 5000);

        } catch (err) {
            setError('Registration failed. This email may already be in use.');
            console.error('Registration failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-lg mx-auto mt-10 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-6">Create a CampusRadar Account</h2>
            
            {/* Role Selector */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">I am a:</label>
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    className="mt-1 w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="STUDENT">Student</option>
                    <option value="RECRUITER">Recruiter</option>
                </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                    <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                </div>
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                
                {/* Role-Specific Fields */}
                {formData.role === 'STUDENT' && (
                    <input type="text" name="rollNumber" placeholder="Roll Number" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                )}
                
                {formData.role === 'RECRUITER' && (
                    <>
                        <input type="text" name="companyName" placeholder="Company Name" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                        <input type="email" name="workEmail" placeholder="Work Email" onChange={handleChange} className="w-full p-3 border rounded-lg" required />
                        <input type="url" name="linkedInProfile" placeholder="LinkedIn Profile URL" onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    </>
                )}
                
                {message && <p className="text-green-600 font-semibold text-center">{message}</p>}
                {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {loading ? 'Registering...' : 'Create Account'}
                </button>
            </form>

            <p className="mt-6 text-sm text-center">
                Already have an account? <Link to="/auth/login" className="text-blue-600 hover:underline">Log in here</Link>
            </p>
        </Card>
    );
};

export default RegistrationPage;

