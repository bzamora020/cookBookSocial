import React from 'react';
import { Link } from 'react-router-dom';

function RecipeNotFound() {
  return (
    <div>
      <h1 style={{ color: 'black', fontSize: '3em' }}>This page was deleted or invalid to begin with.</h1>
      <Link to="/home">
        <button style={{ 
          backgroundColor: '#DB5642',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease-in-out'
        }}>Return to Home</button>
      </Link>
    </div>
  );
}

export default RecipeNotFound;
