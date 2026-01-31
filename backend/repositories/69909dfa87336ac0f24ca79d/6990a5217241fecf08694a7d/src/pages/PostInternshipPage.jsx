import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

const PostInternshipPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        company: '', // FIX: Changed from companyName to company to match backend DTO
        location: '',
        description: '',
        requiredSkills: [],
        durationInWeeks: '', // Added field
        stipend: ''         // Added field
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSkillsChange = (e) => {
        setFormData({ ...formData, requiredSkills: e.target.value.split(',').map(skill => skill.trim()) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await api.post('/recruiter/internships', formData);
            setSuccessMessage('Internship posted successfully! It will be visible once an admin approves it.');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            console.error("Failed to post internship:", err);
            setError('There was an error posting your internship. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold mb-4 inline-block">
                &larr; Back to Dashboard
            </Link>
            <Card>
                <h2 className="text-3xl font-bold mb-6">Post a New Internship</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="title" onChange={handleChange} placeholder="Internship Title" className="w-full p-3 border rounded-lg mt-1" required />
                    {/* FIX: Changed name attribute to 'company' */}
                    <input type="text" name="company" onChange={handleChange} placeholder="Company Name" className="w-full p-3 border rounded-lg mt-1" required />
                    <input type="text" name="location" onChange={handleChange} placeholder="Location (e.g., Mumbai, India or Remote)" className="w-full p-3 border rounded-lg mt-1" required />
                    
                    {/* NEW: Inputs for Duration and Stipend */}
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="durationInWeeks" onChange={handleChange} placeholder="Duration (in weeks)" className="w-full p-3 border rounded-lg mt-1" required />
                        <input type="number" name="stipend" onChange={handleChange} placeholder="Stipend ($)" className="w-full p-3 border rounded-lg mt-1" required />
                    </div>

                    <textarea name="description" onChange={handleChange} rows="5" placeholder="Job Description..." className="w-full p-3 border rounded-lg mt-1" required />
                    <textarea name="requiredSkills" onChange={handleSkillsChange} placeholder="Required Skills (comma-separated, e.g., Java, React)" className="w-full p-3 border rounded-lg mt-1" rows="3" required />

                    {successMessage && <p className="text-green-600 font-semibold text-center">{successMessage}</p>}
                    {error && <p className="text-red-500 font-semibold text-center">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300">
                        {loading ? 'Submitting...' : 'Post Internship for Approval'}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default PostInternshipPage;

