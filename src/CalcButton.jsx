import React from 'react';

const CalcButton = ({ text, onClick, className = '', disabled}) => {
  return (
    <button className={`calc-button ${className}`} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

export default CalcButton;
