import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  };
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  badge,
  onClick,
}) => {
  const badgeColors = {
    blue: 'bg-primary-100 text-primary-800',
    green: 'bg-success-100 text-success-800',
    red: 'bg-error-100 text-error-800',
    yellow: 'bg-warning-100 text-warning-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {badge && (
            <span 
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                badgeColors[badge.color]
              }`}
            >
              {badge.text}
            </span>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">{footer}</div>}
    </div>
  );
};

export default Card;