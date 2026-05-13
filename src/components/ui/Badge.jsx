import React from 'react';
import { motion } from 'framer-motion';
import './Badge.css';

const Badge = ({ children, variant = 'cyan', className = '' }) => {
  return (
    <motion.span 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`cyberpunk-badge badge-${variant} ${className}`}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
