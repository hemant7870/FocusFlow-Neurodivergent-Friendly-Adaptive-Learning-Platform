import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false 
}) => {
  const baseStyles = 'glass-card rounded-xl relative overflow-hidden transition-all duration-300';
  const paddingClass = noPadding ? '' : 'p-8';

  return (
    <div className={`${baseStyles} ${paddingClass} ${className}`}>
      {/* Optional decorative background blur if needed */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
