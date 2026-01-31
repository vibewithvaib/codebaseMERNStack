import React from 'react';

/**
 * A reusable Card component that provides a consistent container style.
 * It's used throughout the application to display information in a clean, modern way.
 * @param {React.ReactNode} children - The content to be rendered inside the card.
 * @param {string} className - Optional additional CSS classes to apply.
 */
const Card = ({ children, className }) => {
    // The `className` prop allows for merging default styles with custom ones.
    const cardClasses = `bg-white rounded-xl shadow-md p-6 ${className || ''}`;

    return (
        <div className={cardClasses}>
            {children}
        </div>
    );
};

export default Card;

