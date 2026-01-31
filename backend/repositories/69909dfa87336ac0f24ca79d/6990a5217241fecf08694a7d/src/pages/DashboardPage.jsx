import React from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

// Lazy load the dashboard components for better performance and code splitting.
const StudentDashboard = React.lazy(() => import('./dashboards/StudentDashboard'));
const RecruiterDashboard = React.lazy(() => import('./dashboards/RecruiterDashboard'));
const AdminDashboard = React.lazy(() => import('./dashboards/AdminDashboard'));

/**
 * A router component that displays the correct dashboard based on the
 * logged-in user's role.
 */
const DashboardPage = () => {
    const { user } = useAuth();

    // While the user object is loading from the context, show a spinner.
    if (!user) {
        return <Spinner />;
    }

    // FIX: Add a defensive check for user.role to prevent the application from crashing
    // if the 'role' claim is missing or not an array in the JWT.
    const userRole = (user.role && Array.isArray(user.role) && user.role.length > 0)
        ? user.role[0]?.authority
        : 'UNKNOWN';

    return (
        // React.Suspense is used with React.lazy to show a fallback (the spinner)
        // while the specific dashboard component's code is being loaded.
        <React.Suspense fallback={<Spinner />}>
            { userRole}
            {userRole === 'ROLE_STUDENT' && <StudentDashboard />}
            {userRole === 'ROLE_RECRUITER' && <RecruiterDashboard />}
            {userRole === 'ROLE_ADMIN' && <AdminDashboard />}
            
            {/* Fallback for any unknown roles */}
            {userRole === 'UNKNOWN' && (
                <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
                    Error: Could not determine user role from the authentication token. Please try logging out and back in.
                </div>
            )}
        </React.Suspense>
    );
};

export default DashboardPage;