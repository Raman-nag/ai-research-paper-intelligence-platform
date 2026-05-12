import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  return (
    <button className={`cyberpunk-btn btn-${variant} ${className}`} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;
