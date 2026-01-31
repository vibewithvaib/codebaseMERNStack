import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 1. Import the Link component
import api from '../../services/api';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';

const AdminDashboard = () => {
    const [pendingStudents, setPendingStudents] = useState([]);
    const [pendingRecruiters, setPendingRecruiters] = useState([]);
    const [pendingInternships, setPendingInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [studentsRes, recruitersRes, internshipsRes] = await Promise.all([
                api.get('/admin/users/pending/students'),
                api.get('/admin/users/pending/recruiters'),
                api.get('/admin/internships/pending'),
            ]);
            setPendingStudents(studentsRes.data);
            setPendingRecruiters(recruitersRes.data);
            setPendingInternships(internshipsRes.data);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            setError('Could not load administrative data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveUser = async (userId) => {
        try {
            await api.patch(`/admin/users/${userId}/approve`);
            fetchData(); // Refresh lists
        } catch (err) {
            console.error("Failed to approve user:", err);
            setError('Failed to approve user. They may have been processed already.');
        }
    };
    
    const handleApproveInternship = async (internshipId) => {
        try {
            await api.patch(`/admin/internships/${internshipId}/approve`);
            fetchData(); // Refresh lists
        } catch (err) {
            console.error("Failed to approve internship:", err);
            setError('Failed to approve internship.');
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            
            {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center">{error}</div>}

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Approvals Card */}
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
                    <h3 className="font-semibold text-lg text-gray-700 mt-4 mb-2">Students ({pendingStudents.length})</h3>
                    {pendingStudents.length > 0 ? (
                        <ul className="space-y-3">{pendingStudents.map(user => (
                            <li key={user.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                {/* 2. FIX: Wrap the name in a Link to the student detail page */}
                                <Link to={`/admin/students/${user.userId}`} className="font-semibold hover:underline">
                                    {user.firstName} {user.lastName} ({user.rollNumber})
                                </Link>
                                <button onClick={() => handleApproveUser(user.userId)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Approve</button>
                            </li>
                        ))}</ul>
                    ) : <p className="text-sm text-gray-500">No pending student approvals.</p>}

                    <h3 className="font-semibold text-lg text-gray-700 mt-6 mb-2">Recruiters ({pendingRecruiters.length})</h3>
                    {pendingRecruiters.length > 0 ? (
                        <ul className="space-y-3">{pendingRecruiters.map(user => (
                            <li key={user.userId} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                {/* 3. FIX: Wrap the name in a Link to the recruiter detail page */}
                                <Link to={`/recruiters/${user.userId}`} className="font-semibold hover:underline">
                                    {user.firstName} {user.lastName} ({user.companyName})
                                </Link>
                                <button onClick={() => handleApproveUser(user.userId)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Approve</button>
                            </li>
                        ))}</ul>
                    ) : <p className="text-sm text-gray-500">No pending recruiter approvals.</p>}
                </Card>

                {/* Internship Approvals Card */}
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Pending Internship Approvals ({pendingInternships.length})</h2>
                    {pendingInternships.length > 0 ? (
                        <ul className="space-y-3">{pendingInternships.map(internship => (
                            <li key={internship.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                <div>
                                    {/* 4. FIX: Wrap the title in a Link to the internship detail page */}
                                    <Link to={`/admin/internships/${internship.id}`} className="font-semibold hover:underline">
                                        {internship.title}
                                    </Link>
                                    <p className="text-sm text-gray-500">{internship.companyName}</p>
                                </div>
                                <button onClick={() => handleApproveInternship(internship.id)} className="bg-green-500 text-white px-3 py-1 text-sm rounded-md hover:bg-green-600">Approve</button>
                            </li>
                        ))}</ul>
                    ) : <p className="text-sm text-gray-500">No pending internship approvals.</p>}
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;

