import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

// --- Reusable UI Components ---
const SkillTag = ({ skill }) => (
    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
);

const StatusBadge = ({ status }) => {
    const styleMap = {
        APPLIED: 'bg-yellow-100 text-yellow-800',
        SHORTLISTED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        HIRED: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styleMap[status]}`}>{status}</span>;
};

const InternshipDetailPage = () => {
    const { internshipId } = useParams();
    const { user } = useAuth();
    const [internship, setInternship] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [newStatuses, setNewStatuses] = useState({}); // State to hold dropdown selections

    const userRole = user?.role[0]?.authority;

    const fetchData = async () => {
        try {
            const internshipRes = await api.get(`/recruiter/internships/${internshipId}`);
            setInternship(internshipRes.data);

            if (userRole === 'ROLE_RECRUITER') {
                const appsRes = await api.get(`/recruiter/internships/${internshipId}/applications`);
                setApplications(appsRes.data);
            }
        } catch (err) {
            console.error("Failed to fetch internship details:", err);
            setError("Could not load internship details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(user) {
            setLoading(true);
            fetchData();
        }
    }, [internshipId, user]);

    // Handler for changing the status dropdown for a specific application
    const handleStatusChange = (applicationId, newStatus) => {
        setNewStatuses(prev => ({
            ...prev,
            [applicationId]: newStatus
        }));
    };

    // Function to handle submitting the status update
    const handleUpdateStatus = async (applicationId, newStatus) => {
        setActionMessage(`Updating status to ${newStatus}...`);
        try {
            await api.patch(`/recruiter/applications/${applicationId}/status`, {
                applicationStatus: newStatus
            });
            setActionMessage(`Application status successfully updated to ${newStatus}.`);
            // Refresh data to show the new status
            fetchData();
        } catch (err) {
            console.error("Failed to update status:", err);
            setActionMessage('Error: Could not update application status.');
        }
    };

    if (loading) return <Spinner />;
    if (error) return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
    if (!internship) return <div className="text-center">Internship not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">&larr; Back to Dashboard</Link>

            <Card>
                <h1 className="text-3xl font-bold">{internship.title}</h1>
                <p className="text-xl text-gray-600 mt-1">{internship.companyName}</p>
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{internship.description}</p>
                </div>
                 <div className="mt-4">
                    <h3 className="font-semibold text-lg mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {internship.requiredSkills.map(skill => <SkillTag key={skill} skill={skill} />)}
                    </div>
                </div>
            </Card>

            {/* Applicant Management Section for Recruiters */}
            {userRole === 'ROLE_RECRUITER' && (
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Applicants ({applications.length})</h2>
                    {actionMessage && <p className="text-center text-sm font-semibold text-green-700 mb-4">{actionMessage}</p>}
                    {applications.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {applications.map(app => (
                                <li key={app.applicationId} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <Link to={`/students/${app.studentId}`} className="text-blue-600 hover:underline font-semibold">
                                            {app.studentEmail}
                                        </Link>
                                        <div className="mt-1">
                                            <StatusBadge status={app.status} />
                                        </div>
                                    </div>
                                    
                                    {/* --- NEW: Manual Status Update UI --- */}
                                    {['APPLIED', 'SHORTLISTED'].includes(app.status) && (
                                        <div className="flex gap-2 self-start sm:self-center">
                                            <select
                                                onChange={(e) => handleStatusChange(app.applicationId, e.target.value)}
                                                className="bg-white border border-gray-300 rounded-md py-1 px-2 text-sm"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Change Status...</option>
                                                {app.status === 'APPLIED' && <option value="SHORTLISTED">Shortlist</option>}
                                                {app.status === 'SHORTLISTED' && <option value="HIRED">Hire</option>}
                                                <option value="REJECTED">Reject</option>
                                            </select>
                                            <button
                                                onClick={() => handleUpdateStatus(app.applicationId, newStatuses[app.applicationId])}
                                                disabled={!newStatuses[app.applicationId]}
                                                className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">No students have applied for this internship yet.</p>}
                </Card>
            )}
        </div>
    );
};

export default InternshipDetailPage;

