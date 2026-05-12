import React from 'react';
import './Badge.css';

const Badge = ({ children, variant = 'cyan', className = '' }) => {
  return (
    <span className={`cyberpunk-badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
