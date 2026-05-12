import React from 'react';
import './Card.css';

const Card = ({ children, className = '', glowColor = 'cyan', delay = 0, style = {}, ...props }) => {
  const glowClass = glowColor === 'purple' ? 'card-glow-purple' : 'card-glow-cyan';
  return (
    <div 
      className={`glass-panel cyberpunk-card animate-fade-in ${glowClass} ${className}`} 
      style={{ animationDelay: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
