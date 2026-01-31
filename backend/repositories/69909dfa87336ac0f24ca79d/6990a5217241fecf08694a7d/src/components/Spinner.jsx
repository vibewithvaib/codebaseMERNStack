import React from 'react';

/**
 * A simple, reusable loading spinner component.
 * It's used to indicate that data is being fetched from the backend.
 */
const Spinner = () => {
    return (
        <div className="flex justify-center items-center h-full my-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
};

export default Spinner;

