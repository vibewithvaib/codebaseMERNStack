import React, { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';

import api from '../../services/api';

import Card from '../../components/Card';

import Spinner from '../../components/Spinner';



const RecruiterDashboard = () => {

    const [internships, setInternships] = useState([]);

    const [loading, setLoading] = useState(true);

    const [shortlistingId, setShortlistingId] = useState(null);

    const [error, setError] = useState('');

    const [successMessage, setSuccessMessage] = useState('');



    const fetchInternships = async () => {

        setLoading(true);

        try {

            const res = await api.get('/recruiter/internships');

            setInternships(res.data);

        } catch (err) {

            setError('Could not load your internship postings.');

        } finally {

            setLoading(false);

        }

    };



    useEffect(() => {

        fetchInternships();

    }, []);



    const handleAiShortlist = async (id) => {

        setShortlistingId(id);

        setSuccessMessage('');

        try {

            const response = await api.post(`/recruiter/internships/${id}/ai-shortlist`);

            setSuccessMessage(`AI has successfully shortlisted ${response.data.length} candidate(s)!`);

        } catch (err) {

            setError('An error occurred during AI shortlisting.');

        } finally {

            setShortlistingId(null);

        }

    };



    if (loading) return <Spinner />;



    return (

        <div className="space-y-8 animate-fade-in">

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">

                <h1 className="text-4xl font-bold text-gray-800">Recruiter Dashboard</h1>

               

                <Link
                    to="/post-internship"
                    className="bg-green-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                    + Post New Internship
                </Link>
            </div>


            {error && <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center">{error}</div>}
            {successMessage && <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">{successMessage}</div>}



            <Card>

                <h2 className="text-2xl font-bold mb-4">My Internship Postings</h2>

                {internships.length > 0 ? (
                    <div className="space-y-6">
                        {internships.map(internship => (
                            <div className="border p-4 rounded-lg bg-gray-50">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold"><Link to={ `/internships/${internship.id}`}>{internship.title}</Link></h3>

                                       

                                        { console.log(internship.id)}

                                    </div>

                                    <button

                                        onClick={() => handleAiShortlist(internship.id)}

                                        className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"

                                        title= "Use AI to analyze applicants."

                                    >

                                        {shortlistingId === internship.id ? 'AI is Working...' : '🤖 AI Shortlist'}

                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                ) : (

                    <p className="text-gray-500">You have not posted any internships yet. Click the button above to create one!</p>

                )}

            </Card>

        </div>

    );

};



export default RecruiterDashboard;