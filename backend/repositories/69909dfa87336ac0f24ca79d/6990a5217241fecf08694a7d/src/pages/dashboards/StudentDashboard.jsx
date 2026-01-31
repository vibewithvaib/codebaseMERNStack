import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';

// --- Reusable UI Components ---
const SkillTag = ({ skill }) => <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>;
const StatusBadge = ({ status }) => {
    const styleMap = { APPLIED: 'bg-yellow-100 text-yellow-800', SHORTLISTED: 'bg-green-100 text-green-800', REJECTED: 'bg-red-100 text-red-800', INVITED: 'bg-purple-100 text-purple-800' };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styleMap[status] || 'bg-gray-100'}`}>{status}</span>;
};

const StudentDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [applications, setApplications] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        // Fetch only profile and application data initially.
        try {
            const [profileRes, appsRes] = await Promise.all([
                api.get('/student/profile'),
                api.get('/student/my-applications'),
            ]);
            setProfile(profileRes.data);
            setApplications(appsRes.data);
        } catch (err) {
            setError('Could not load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    const handleGetRecommendations = async () => {
        setAiLoading(true);
        setError('');
        try {
            const res = await api.get('/ai/recommend/internships');
            setRecommendations(res.data);
        } catch (err) {
            setError('Could not fetch AI recommendations.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleApply = async (internshipId) => {
        setActionMessage({ type: 'info', text: 'Applying...' });
        try {
            await api.post(`/apply/${internshipId}`);
            setActionMessage({ type: 'success', text: 'Successfully applied!' });
            const appsRes = await api.get('/student/my-applications');
            setApplications(appsRes.data);
        } catch (err) {
            setActionMessage({ type: 'error', text: err.response?.data?.message || 'You have already applied for this internship.' });
        }
    };
    
    const hasSkills = profile && profile.skills && profile.skills.length > 0;

    if (loading) return <Spinner />;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Student Dashboard</h1>
                <Link to="/edit-student-profile" className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300">Edit Profile</Link>
            </div>

            {actionMessage.text && (
                <div className={`p-4 rounded-lg text-center font-semibold ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : actionMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {actionMessage.text}
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-2xl font-bold mb-4">My Profile</h2>
                    <p className="font-semibold text-lg">{user.sub}</p>
                    <p className="text-gray-600 mt-1">{profile?.headline}</p>
                    <div className="mt-4"><h3 className="font-semibold">Skills:</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {hasSkills ? profile.skills.map(skill => <SkillTag key={skill} skill={skill} />) : <p className="text-sm text-gray-500">Add skills to your profile to get AI recommendations!</p>}
                        </div>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-2xl font-bold mb-4">My Applications</h2>
                    {applications.length > 0 ? (
                        <ul className="space-y-3 max-h-60 overflow-y-auto">{applications.map(app => (
                            <li key={app.applicationId} className="flex justify-between items-center">
                                <Link to={`/internships/student/${app.internshipId}`} className="font-semibold hover:underline">
                                    {app.internshipTitle}
                                </Link>
                                <StatusBadge status={app.status} /></li>
                        ))}</ul>
                    ) : <p className="text-gray-500">You haven't applied to any internships yet.</p>}
                </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">AI Recommended Internships</h2>
                    <button onClick={handleGetRecommendations} disabled={!hasSkills || aiLoading} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                        {aiLoading ? 'Thinking...' : 'Get Recommendations'}
                    </button>
                </div>
                {aiLoading && <Spinner />}
                {recommendations && (
                    recommendations.length > 0 ? (
                        <ul className="space-y-4 pt-4 border-t">{recommendations.map(rec => (
                            <li key={rec.internshipId} className="border p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <Link to={`/internships/student/${rec.internshipId}`} className="font-bold text-lg hover:underline">
                                       {rec.postingText.split('\n')[1].replace('Title: ', '')}
                                    </Link>
                                </div>
                                <button onClick={() => handleApply(rec.internshipId)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Apply Now</button>
                            </li>
                        ))}</ul>
                    ) : <p className="text-gray-500 pt-4 border-t">The AI couldn't find any suitable internships for your profile.</p>
                )}
            </Card>
        </div>
    );
};
export default StudentDashboard;

