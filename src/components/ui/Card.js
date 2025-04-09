// src/components/ui/Card.js

import React from 'react';
import './Card.css';

const Card = ({ title, children }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;

