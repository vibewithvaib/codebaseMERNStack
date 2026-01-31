import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

/**
 * A page component that allows a student to create or update their profile.
 */
const StudentProfileEditPage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        headline: '',
        skills: [],
        rollNumber: '',
        resumeUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/student/profile');
                // Ensure skills are handled as an array, even if null, for consistent state
                setProfile({ ...res.data, skills: res.data.skills || [] });
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError("Could not load your profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    // Special handler for the skills textarea to convert comma-separated string to an array
    const handleSkillsChange = (e) => {
        setProfile({ ...profile, skills: e.target.value.split(',').map(skill => skill.trim()) });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            // The backend's StudentProfileRequest DTO expects a 'rollNo' field
            const payload = {
                headline: profile.headline,
                resumeUrl: profile.resumeUrl,
                skills: profile.skills,
                rollNo: profile.rollNumber // Map the state's rollNumber to rollNo
            };
            await api.post('/student/profile', payload);
            setSuccessMessage('Profile updated successfully!');
            // Redirect back to the dashboard after a short delay
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError("Failed to save profile. Please check your inputs and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Show a spinner for the initial data fetch
    if (loading && !profile.headline) return <Spinner />;

    return (
        <Card className="max-w-lg mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold mb-6">Edit My Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Headline</label>
                    <input type="text" name="headline" value={profile.headline || ''} onChange={handleChange} placeholder="e.g., Aspiring Software Developer" className="w-full p-3 border rounded-lg mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                    <input type="text" name="rollNumber" value={profile.rollNumber || ''} onChange={handleChange} placeholder="Your university roll number" className="w-full p-3 border rounded-lg mt-1" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resume URL</label>
                    <input type="url" name="resumeUrl" value={profile.resumeUrl || ''} onChange={handleChange} placeholder="https://example.com/my-resume.pdf" className="w-full p-3 border rounded-lg mt-1" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <textarea 
                        name="skills" 
                        value={profile.skills.join(', ')} // Display skills as a comma-separated string
                        onChange={handleSkillsChange} 
                        placeholder="Enter skills, separated by commas (e.g., Java, React, Python)" 
                        className="w-full p-3 border rounded-lg mt-1" 
                        rows="3"
                    ></textarea>
                </div>

                {successMessage && <p className="text-green-600 font-semibold text-center">{successMessage}</p>}
                {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </Card>
    );
};

export default StudentProfileEditPage;

