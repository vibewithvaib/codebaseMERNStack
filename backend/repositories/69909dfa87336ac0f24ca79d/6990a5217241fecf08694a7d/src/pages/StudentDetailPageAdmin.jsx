import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
 * A page component that displays the detailed view of a single student profile.
 * This is used by recruiters and admins to evaluate a candidate.
 */
const StudentDetailPageAdmin = () => {
    const { studentId } = useParams(); // Gets the '5' from the URL '/students/5'
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            setError('');
            try {
                // Call the backend endpoint to get the student's full details
                const response = await api.get(`/admin/students/${studentId}`);
                setStudent(response.data);
            } catch (err) {
                console.error("Failed to fetch student details:", err);
                setError("Could not load student details. Please try again or check if the student exists.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId]); // Re-run the effect if the studentId in the URL changes

    if (loading) return <Spinner />;

    if (error) return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>;
    
    if (!student) return <div className="text-center">Student profile not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/dashboard" className="text-blue-600 hover:underline font-semibold">
                &larr; Back to Dashboard
            </Link>

            <Card>
                <h1 className="text-3xl md:text-4xl font-bold">{student.firstName} {student.lastName}</h1>
                <p className="text-xl text-gray-600 mt-1">{student.headline || 'No headline provided.'}</p>
                
                {student.resumeUrl && (
                     <a 
                        href={student.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline mt-2 inline-block font-semibold"
                    >
                        View Resume &rarr;
                    </a>
                )}

                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Roll Number</h3>
                    <p className="text-gray-700">{student.rollNumber}</p>
                </div>
                
                <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {student.skills && student.skills.length > 0 ? 
                            student.skills.map(skill => <SkillTag key={skill} skill={skill} />) :
                            <p className="text-sm text-gray-500">No skills listed for this student.</p>
                        }
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentDetailPageAdmin;

