import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Core Components ---
import NavBar from './components/NavBar';
import Spinner from './components/Spinner';

// --- Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import StudentProfileEditPage from './pages/StudentProfileEditPage';
import InternshipDetailPage from './pages/InternshipDetailPage';
import StudentDetailPage from './pages/StudentDetailPage';
import RecruiterDetailPage from './pages/RecruiterDetailPage';
import PostInternshipPage from './pages/PostInternshipPage';
import InternshipDetailPageStudent from './pages/InternshipDetailPageStudent';
import StudentDetailPageAdmin from './pages/StudentDetailPageAdmin';
import InternshipDetailPageAdmin from './pages/InternshipDetailPageAdmin';


/**
 * A wrapper component that protects routes from unauthenticated access.
 * If a user is not logged in, it redirects them to the login page.
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return <Spinner />; // Show a spinner while checking auth status
    }
    if (!user) {
        // If not logged in, redirect to the login page
        return <Navigate to="/auth/login" replace />;
    }
    return children;
};

/**
 * The main App component that defines the entire application structure and routing.
 */
function App() {
    return (
        <AuthProvider>
            <HashRouter>
                <div className="font-sans bg-gray-50 min-h-screen">
                    <NavBar />
                    <main className="container mx-auto p-4 md:p-8">
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/auth/login" element={<LoginPage />} />
                            <Route path="/auth/register" element={<RegistrationPage />} />

                            {/* --- Protected Routes (require a user to be logged in) --- */}
                            <Route
                                path="/dashboard"
                                element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/internships/:internshipId"
                                element={<ProtectedRoute><InternshipDetailPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/internships/student/:internshipId"
                                element={<ProtectedRoute><InternshipDetailPageStudent></InternshipDetailPageStudent></ProtectedRoute>}
                            />
                            <Route
                                path='/admin/students/:studentId'
                                element={<ProtectedRoute><StudentDetailPageAdmin/></ProtectedRoute>}
                            />
                            <Route
                                path='/admin/internships/:internshipId'
                                element={<ProtectedRoute><InternshipDetailPageAdmin /></ProtectedRoute>}
                            />
                            <Route
                                path="/students/:studentId"
                                element={<ProtectedRoute><StudentDetailPage /></ProtectedRoute>}
                            />
                             <Route
                                path="/recruiters/:recruiterId"
                                element={<ProtectedRoute><RecruiterDetailPage /></ProtectedRoute>}
                            />
                            <Route
                                path="/edit-student-profile"
                                element={<ProtectedRoute><StudentProfileEditPage /></ProtectedRoute>}
                            />
                            <Route
                  path='/post-internship'
                element={<ProtectedRoute><PostInternshipPage/></ProtectedRoute>}
/>
                            {/* Redirect old/mistyped paths for convenience */}
                            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
                            <Route path="/register" element={<Navigate to="/auth/register" replace />} />
                        </Routes>
                    </main>
                </div>
            </HashRouter>
        </AuthProvider>
    );
}

export default App;

