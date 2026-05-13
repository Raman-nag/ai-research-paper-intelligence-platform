import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ children, variant = 'primary', icon, className = '', ...props }) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`cyberpunk-btn btn-${variant} ${className}`} 
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-content">{children}</span>
    </motion.button>
  );
};

export default Button;
