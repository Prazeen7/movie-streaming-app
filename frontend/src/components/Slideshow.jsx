import React, { useState, useEffect } from 'react';

export default function Slideshow({ movies, selectedMovie, setSelectedMovie }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % movies.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [movies.length]);

    // Helper to get genre string from genre_ids
    const getGenreString = (genreIds) => {
        const genreMap = {
            28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
            80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
            14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
            9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
            53: 'Thriller', 10752: 'War', 37: 'Western'
        };
        if (!genreIds || genreIds.length === 0) return 'Drama';
        return genreIds.slice(0, 2).map(id => genreMap[id] || '').filter(Boolean).join(' · ');
    };

    // Get year from release_date
    const getYear = (date) => {
        if (!date) return '2026';
        return date.split('-')[0] || '2026';
    };

    // Get rating or default
    const getRating = (vote) => {
        if (!vote) return '9.4';
        return vote.toFixed(1);
    };

    return (
        <div style={{ 
            width: '100%', 
            position: 'relative',
            background: '#0f0f1a',
            marginTop: '-70px',
        }}>
            <div style={{
                display: 'flex',
                overflow: 'hidden',
                width: '100%',
                height: '550px',
                background: '#0f0f1a',
                position: 'relative',
                borderRadius: '0',
            }}>
                {movies.map((movie, index) => (
                    <div
                        key={movie.id}
                        style={{
                            minWidth: '100%',
                            transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            transform: `translateX(-${currentSlide * 100}%)`,
                            position: 'relative',
                            height: '550px',
                            width: '100%',
                        }}
                    >
                        {/* Backdrop image - positioned slightly down */}
                        {movie.backdrop_path && (
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 20%',
                                backgroundRepeat: 'no-repeat',
                                backgroundColor: '#0f0f1a',
                            }} />
                        )}

                        {/* Dark gradient overlay with #0f0f1a color */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `linear-gradient(to bottom, #0f0f1a 0%, rgba(15, 15, 26, 0) 25%, rgba(15, 15, 26, 0) 60%, #0f0f1a 100%)`,
                        }} />

                        {/* Content at bottom-left */}
                        <div style={{
                            position: 'absolute',
                            bottom: '3rem',
                            left: '3.5rem',
                            zIndex: 1,
                            maxWidth: '650px',
                            textAlign: 'left',
                        }}>
                            {/* Title */}
                            <h2 style={{
                                fontSize: '2.5rem',
                                marginBottom: '0.5rem',
                                color: '#fff',
                                fontWeight: '700',
                                letterSpacing: '-0.5px',
                                textShadow: '0 2px 30px rgba(0,0,0,0.7)',
                                lineHeight: '1.1',
                            }}>
                                {movie.title.toUpperCase()}
                            </h2>

                            {/* Rating & Meta */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.6rem',
                                flexWrap: 'wrap',
                            }}>
                                <span style={{
                                    color: '#FFD700',
                                    fontSize: '0.7rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                }}>
                                    ⭐ {getRating(movie.vote_average)}
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.7rem',
                                    fontWeight: '300',
                                }}>
                                    ·
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.7rem',
                                    fontWeight: '300',
                                }}>
                                    {getYear(movie.release_date)}
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.7rem',
                                    fontWeight: '300',
                                }}>
                                    ·
                                </span>
                                <span style={{
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.7rem',
                                    fontWeight: '300',
                                }}>
                                    {getGenreString(movie.genre_ids)}
                                </span>
                            </div>

                            {/* Overview */}
                            <p style={{
                                fontSize: '0.7rem',
                                opacity: 0.8,
                                maxWidth: '550px',
                                color: '#e0e0e0',
                                lineHeight: '1.6',
                                marginBottom: '1.2rem',
                                textShadow: '0 1px 20px rgba(0,0,0,0.5)',
                            }}>
                                {movie.overview || 'A literature professor discovers a student\'s talent and offers him writing lessons — but as he sinks into the story, their sessions spiral into chaos.'}
                            </p>

                            {/* Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                alignItems: 'center', 
                                flexWrap: 'wrap' 
                            }}>
                                <button style={{
                                    padding: '0.7rem 2.5rem',
                                    backgroundColor: '#e50914',
                                    border: 'none',
                                    borderRadius: '30px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 25px rgba(229, 9, 20, 0.35)',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'scale(1.05)';
                                        e.target.style.boxShadow = '0 6px 35px rgba(229, 9, 20, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'scale(1)';
                                        e.target.style.boxShadow = '0 4px 25px rgba(229, 9, 20, 0.35)';
                                    }}
                                    onClick={() => setSelectedMovie(movie)}>
                                    ▶ Play
                                </button>
                                <button style={{
                                    padding: '0.7rem 2rem',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '30px',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                    onMouseEnter={(e) => {
                                        e.target.style.borderColor = '#fff';
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                                        e.target.style.background = 'transparent';
                                    }}>
                                    See More
                                </button>
                            </div>
                        </div>

                        {/* Slide counter */}
                        <div style={{
                            position: 'absolute',
                            bottom: '1.5rem',
                            right: '2.5rem',
                            color: 'rgba(255,255,255,0.15)',
                            fontSize: '0.8rem',
                            fontWeight: '300',
                            letterSpacing: '2px',
                            zIndex: 2,
                        }}>
                            {String(index + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>

            {/* Slide indicators */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1.2rem 0 1.5rem 0',
                background: '#0f0f1a',
            }}>
                {movies.map((_, idx) => (
                    <span
                        key={idx}
                        style={{
                            width: idx === currentSlide ? '35px' : '10px',
                            height: '3px',
                            borderRadius: '3px',
                            backgroundColor: idx === currentSlide ? '#e50914' : 'rgba(255,255,255,0.15)',
                            cursor: 'pointer',
                            transition: 'all 0.4s ease',
                        }}
                        onClick={() => setCurrentSlide(idx)}
                    />
                ))}
            </div>
        </div>
    );
}