import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

/**
 * A page component that displays the detailed view of a single recruiter profile.
 * This is primarily used by an Admin to review a recruiter's credentials before approval.
 */
const RecruiterDetailPage = () => {
    const { recruiterId } = useParams();
    const [recruiter, setRecruiter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecruiterData = async () => {
            setLoading(true);
            setError('');
            try {
                // Call the backend endpoint to get the recruiter's full details.
                const response = await api.get(`/admin/recruiters/${recruiterId}`);
                setRecruiter(response.data);
            } catch (err) {
                console.error("Failed to fetch recruiter details:", err);
                setError("Could not load recruiter details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecruiterData();
    }, [recruiterId]);

    if (loading) return <Spinner />;

    if (error) return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
    
    if (!recruiter) return <div className="text-center">Recruiter profile not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
                &larr; Back to Dashboard
            </Link>

            <Card>
                <h1 className="text-3xl md:text-4xl font-bold">{recruiter.firstName} {recruiter.lastName}</h1>
                <p className="text-xl text-gray-600 mt-1">
                    Company: <span className="font-semibold">{recruiter.companyName}</span>
                </p>
                <a 
                    href={recruiter.linkedInProfile} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline mt-4 inline-block font-semibold"
                >
                    View LinkedIn Profile &rarr;
                </a>

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Contact Email</h3>
                    <p className="text-gray-700">{recruiter.workEmail}</p>
                </div>
            </Card>
        </div>
    );
};

export default RecruiterDetailPage;
