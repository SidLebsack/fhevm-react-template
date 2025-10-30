import React from 'react';

export interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'bordered';
  footer?: React.ReactNode;
}

/**
 * Card component for displaying FHE operations and results
 * Provides a consistent container for UI elements
 */
export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
  variant = 'default',
  footer
}) => {
  const variantStyles = {
    default: 'bg-white shadow-md',
    gradient: 'bg-gradient-to-r from-purple-50 to-pink-50 shadow-md',
    bordered: 'bg-white border-2 border-indigo-200'
  };

  return (
    <div className={`rounded-lg overflow-hidden ${variantStyles[variant]} ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && (
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
