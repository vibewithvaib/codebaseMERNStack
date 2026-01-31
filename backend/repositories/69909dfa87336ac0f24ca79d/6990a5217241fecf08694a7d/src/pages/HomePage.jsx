import React from 'react';
import { Link } from 'react-router-dom';

/**
 * The main landing page for the CampusRadar application.
 * It provides a welcome message and a clear call-to-action for users.
 */
const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 tracking-tight leading-tight">
                Welcome to CampusRadar
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl">
                Your AI-powered bridge to the perfect internship. We connect students, recruiters, and faculty to create a seamless, transparent, and intelligent ecosystem.
            </p>
            
            <div className="mt-8 flex gap-4">
                <Link
                    to="/auth/register"
                    className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </div>
    );
};

export default HomePage;

