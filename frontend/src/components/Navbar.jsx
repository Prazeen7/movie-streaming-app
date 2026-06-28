import React from 'react';

export default function Navbar({ searchTerm, setSearchTerm }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      backgroundColor: 'transparent',
      borderBottom: 'none',
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: 'none',
      backdropFilter: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#e50914',
          textShadow: '0 2px 10px rgba(0,0,0,0.8)',
        }}>MovieDash</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Search movies & series..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#fff',
            width: '250px',
            outline: 'none',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
            e.target.style.borderColor = '#e50914';
            e.target.style.boxShadow = '0 4px 25px rgba(229, 9, 20, 0.3)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = 'rgba(0,0,0,0.6)';
            e.target.style.borderColor = 'rgba(255,255,255,0.2)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
          }}
        />
        <span style={{ fontSize: '1.2rem' }}></span>
      </div>
    </nav>
  );
}