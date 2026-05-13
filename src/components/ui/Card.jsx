import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({ children, className = '', glowColor = 'cyan', delay = 0, style = {}, ...props }) => {
  const glowClass = glowColor === 'purple' ? 'card-glow-purple' : 'card-glow-cyan';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.001 || 0, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -5, boxShadow: glowColor === 'purple' ? '0 10px 30px rgba(157, 0, 255, 0.2)' : '0 10px 30px rgba(0, 243, 255, 0.2)' }}
      className={`glass-panel cyberpunk-card ${glowClass} ${className}`} 
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
