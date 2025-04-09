// Input.js
import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="input" // Add custom styles if necessary
    />
  );
};

export default Input;

