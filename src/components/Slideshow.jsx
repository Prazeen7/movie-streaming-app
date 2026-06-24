import React, { useState, useEffect } from 'react';

export default function Slideshow({ movies }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % movies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [movies.length]);

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        overflow: 'hidden', 
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
        maxHeight: '400px',
      }}>
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            style={{
              minWidth: '100%',
              transition: 'transform 0.8s ease',
              transform: `translateX(-${currentSlide * 100}%)`,
              position: 'relative',
              background: `linear-gradient(135deg, #1a1a2e, #16213e)`,
              display: 'flex',
              alignItems: 'center',
              padding: '1rem 3rem',
              gap: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <img 
              src={movie.image} 
              alt={movie.title} 
              style={{ 
                width: '180px', 
                height: '260px', 
                objectFit: 'cover', 
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              }} 
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fff' }}>{movie.title}</h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.8, color: '#ccc' }}>{movie.year} · {movie.genre}</p>
              <p style={{ fontSize: '1rem', opacity: 0.6, maxWidth: '400px', color: '#aaa' }}>
                {movie.type === 'movie' ? 'Movie' : 'Series'} — Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
              <button style={{
                marginTop: '1rem',
                padding: '0.8rem 2.5rem',
                backgroundColor: '#e50914',
                border: 'none',
                borderRadius: '30px',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(229, 9, 20, 0.5)',
                transition: '0.3s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ▶ Play Now
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Slide indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', marginTop: '1rem' }}>
        {movies.map((_, idx) => (
          <span
            key={idx}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: idx === currentSlide ? '#e50914' : '#444',
              cursor: 'pointer',
              transition: '0.3s',
            }}
            onClick={() => setCurrentSlide(idx)}
          />
        ))}
      </div>
    </div>
  );
}