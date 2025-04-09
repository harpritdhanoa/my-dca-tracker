// Label.js
import React from 'react';

const Label = ({ children, htmlFor }) => {
  return (
    <label htmlFor={htmlFor} className="label"> {/* Add custom styles if necessary */}
      {children}
    </label>
  );
};

export default Label;

