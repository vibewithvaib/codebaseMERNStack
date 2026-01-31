import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
 * A page component that displays the detailed view of a single internship.
 * It includes special functionality for Admins to approve pending posts.
 */
const InternshipDetailPageAdmin = () => {
    const { internshipId } = useParams();
    const { user } = useAuth(); // Get the logged-in user's role
    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchInternshipData = async () => {
        setLoading(true);
        try {
            // This endpoint is accessible to any authenticated user
            const response = await api.get(`/admin/internships/${internshipId}`);
            setInternship(response.data);
        } catch (err) {
            console.error("Failed to fetch internship details:", err);
            setError("Could not load internship details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternshipData();
    }, [internshipId]);

    const handleApprove = async () => {
        try {
            // Call the admin-specific endpoint to approve the internship
            await api.patch(`/admin/internships/${internshipId}/approve`);
            // Redirect the admin back to their dashboard after approval
            navigate('/dashboard');
        } catch (err) {
            console.error("Failed to approve internship:", err);
            setError("Failed to approve the internship. Please try again.");
        }
    };

    const isAdmin = user && user.role[0]?.authority === 'ROLE_ADMIN';
    const isPendingApproval = internship && !internship.isApproved;

    if (loading) return <Spinner />;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
    if (!internship) return <div className="text-center">Internship not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
                &larr; Back to Dashboard
            </Link>

            {/* --- Admin-Only Approval Section --- */}
            {isAdmin && isPendingApproval && (
                <Card className="bg-yellow-50 border border-yellow-300">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-yellow-800">Admin Action Required</h2>
                            <p className="text-yellow-700">This internship is pending review and is not yet visible to students.</p>
                        </div>
                        <button 
                            onClick={handleApprove}
                            className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Approve Internship
                        </button>
                    </div>
                </Card>
            )}

            <Card>
                <h1 className="text-3xl md:text-4xl font-bold">{internship.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{internship.company || 'N/A'}</p>

                <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Details</h3>
                        <p><strong>Location:</strong> {internship.location}</p>
                        <p><strong>Duration:</strong> {internship.durationInWeeks} weeks</p>
                        <p><strong>Stipend:</strong> ${internship.stipend}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {internship.requiredSkills?.map(skill => <SkillTag key={skill} skill={skill} />)}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default InternshipDetailPageAdmin;

