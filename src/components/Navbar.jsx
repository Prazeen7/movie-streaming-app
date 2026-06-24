import React from 'react';

export default function Navbar({ searchTerm, setSearchTerm }) {
  return (
    <nav style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem',
      backgroundColor: '#1a1a2e',
      borderBottom: '1px solid #333',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e50914' }}>MovieDash</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search movies & series..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '30px',
            border: 'none',
            backgroundColor: '#2a2a40',
            color: '#fff',
            width: '250px',
            outline: 'none',
            fontSize: '1rem',
          }}
        />
        <span style={{ fontSize: '1.2rem' }}></span>
      </div>
    </nav>
  );
}