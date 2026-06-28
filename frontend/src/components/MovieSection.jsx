import React, { useRef } from 'react';

const scrollBtnStyle = {
  backgroundColor: '#2a2a40',
  border: 'none',
  color: '#fff',
  padding: '0.5rem 1rem',
  borderRadius: '30px',
  cursor: 'pointer',
  fontSize: '1.2rem',
  transition: '0.2s',
  width: '44px',
  height: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export default function MovieSection({ title, movies, selectedMovie, setSelectedMovie }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
          {title}
        </h2>
        <div>
          <button onClick={scrollLeft} style={scrollBtnStyle}>◀</button>
          <button onClick={scrollRight} style={{ ...scrollBtnStyle, marginLeft: '0.5rem' }}>▶</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '1.5rem',
          padding: '1rem 0.5rem',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {movies.length > 0 ? (
          movies.map((item) => (
            <div key={item.id} style={{ minWidth: '200px', maxWidth: '200px', cursor: "pointer" }} onClick={() => setSelectedMovie(item)}>
              <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  height: '280px',
                  objectFit: 'cover'
                }}
              />
              <p style={{ marginTop: '0.5rem', fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
                {item.title}
              </p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, textAlign: 'center', color: '#ccc' }}>
                {item.release_date}
              </p>
            </div>
          ))
        ) : (
          <p style={{ padding: '1rem', color: '#aaa' }}>No {title.toLowerCase()} found</p>
        )}
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}