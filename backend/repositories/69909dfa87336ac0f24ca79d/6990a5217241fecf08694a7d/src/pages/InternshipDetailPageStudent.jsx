import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

// --- Reusable UI Components ---
const SkillTag = ({ skill }) => (
    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
        {skill}
    </span>
);

/**
 * A page component that displays the detailed view of a single internship for a student.
 * It provides the functionality for the student to apply directly from this page.
 */
const InternshipDetailPageStudent = () => {
    const { internshipId } = useParams(); // Gets the ID from the URL, e.g., '4'
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInternshipData = async () => {
            setLoading(true);
            setError('');
            try {
                // Call the specific student endpoint to get internship details.
                const response = await api.get(`/student/internships/${internshipId}`);
                setInternship(response.data);
            } catch (err) {
                console.error("Failed to fetch internship details:", err);
                setError("Could not load internship details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchInternshipData();
    }, [internshipId]); // Re-run this effect if the ID in the URL changes

    const handleApply = async () => {
        setActionMessage({ type: 'info', text: 'Submitting your application...' });
        try {
            // Call the backend endpoint to create the application.
            await api.post(`/apply/${internshipId}`);
            setActionMessage({ type: 'success', text: 'Successfully applied! Redirecting to dashboard...' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'You have already applied for this internship.' });
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
    if (!internship) return <div className="text-center">Internship not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
                &larr; Back to Dashboard
            </Link>

            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold">{internship.title}</h1>
                        <p className="text-xl text-gray-600 mt-1">{internship.companyName}</p>
                    </div>
                    <button 
                        onClick={handleApply}
                        className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors w-full md:w-auto"
                    >
                        Apply Now
                    </button>
                </div>
                
                {actionMessage.text && (
                    <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {actionMessage.text}
                    </div>
                )}

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
                </div>

                 <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Location</h3>
                    <p className="text-gray-700">{internship.location}</p>
                </div>
                
                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {internship.requiredSkills && internship.requiredSkills.length > 0 ? 
                            internship.requiredSkills.map(skill => <SkillTag key={skill} skill={skill} />) :
                            <p className="text-sm text-gray-500">No specific skills listed.</p>
                        }
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InternshipDetailPageStudent;

