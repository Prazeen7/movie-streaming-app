import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Slideshow from '../components/Slideshow';
import TvSection from '../components/TvSection';
import MovieSection from '../components/MovieSection';
import Loader from '../components/Loader';

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [filteredMovie, setFilteredMovie] = useState([]);
  const [filteredTv, setFilteredTv] = useState([]);
  const [tv, setTv] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch trending movies
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trending/movie`);
        if (!response.ok) throw new Error('Failed to fetch movies');
        const data = await response.json();
        setMovies(data.results || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      }
    };
    fetchMovies();
  }, []);

  // Fetch trending TV
  useEffect(() => {
    const fetchTv = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/trending/tv`);
        if (!response.ok) throw new Error('Failed to fetch TV shows');
        const data = await response.json();
        setTv(data.results || []);
      } catch (error) {
        console.error('Error fetching TV shows:', error);
        setTv([]);
      }
    };
    fetchTv();
  }, []);

   useEffect(() => {
    const checkLoading = () => {
      if (movies.length >= 0 && tv.length >= 0) {
        setTimeout(() => {
          setInitialLoading(false);
        }, 500);
      }
    };
    
    if (movies.length > 0 || tv.length > 0) {
      setTimeout(() => {
        setInitialLoading(false);
      }, 300);
    }
  }, [movies, tv]);

  // Search functionality with debounce
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMovie([]);
      setFilteredTv([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/search?query=${encodeURIComponent(searchTerm)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setFilteredMovie(data.movies || []);
        setFilteredTv(data.tv || []);
      } catch (error) {
        console.error('Error searching:', error);
        setFilteredMovie([]);
        setFilteredTv([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const slideshowMovies = movies.slice(0, 5);

  if (initialLoading) {
    return <Loader fullScreen transparent={false} />;
  }

  return (
    <div style={{ backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {loading && <Loader fullScreen transparent />}

      {searchTerm ? (
        <>
          {filteredMovie.length > 0 && (
            <MovieSection
              title="Movies"
              movies={filteredMovie}
              selectedMovie={selectedMovie}
              setSelectedMovie={setSelectedMovie}
            />
          )}
          {filteredTv.length > 0 && (
            <TvSection
              title="Series"
              movies={filteredTv}
              selectedMovie={selectedMovie}
              setSelectedMovie={setSelectedMovie}
            />
          )}
          {filteredMovie.length === 0 && filteredTv.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              No results found for "{searchTerm}"
            </div>
          )}
        </>
      ) : (
        <>
          <Slideshow
            movies={slideshowMovies}
            selectedMovie={selectedMovie}
            setSelectedMovie={setSelectedMovie}
          />
          <MovieSection
            title="Movies"
            movies={movies}
            selectedMovie={selectedMovie}
            setSelectedMovie={setSelectedMovie}
          />
          <TvSection
            title="Series"
            movies={tv}
            selectedMovie={selectedMovie}
            setSelectedMovie={setSelectedMovie}
          />
        </>
      )}

      {/* Modal Player */}
      {selectedMovie && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => setSelectedMovie(null)}
        >
          <div
            style={{
              position: 'relative',
              width: '92%',
              maxWidth: '1100px',
              aspectRatio: '16/9',
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.95)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '18px',
                fontSize: '1.8rem',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                zIndex: 10,
                opacity: 0.8,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = '1';
                e.target.style.background = 'rgba(0,0,0,0.8)';
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '0.8';
                e.target.style.background = 'rgba(0,0,0,0.6)';
              }}
            >
              ✕
            </button>
            <iframe
              src={(() => {
                const isMovie = selectedMovie.release_date;
                return isMovie
                  ? `https://www.vidking.net/embed/movie/${selectedMovie.id}?color=e50914&autoPlay=true`
                  : `https://www.vidking.net/embed/tv/${selectedMovie.id}/1/1?color=e50914&autoPlay=true`;
              })()}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title={selectedMovie.title || selectedMovie.name}
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}