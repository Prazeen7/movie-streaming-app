import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Slideshow from '../components/Slideshow';
import MovieSection from '../components/MovieSection';
import Wednesday from '../assets/wednesday.jpg';
import Inception from '../assets/inception.jpg';
import Avengers from '../assets/Avengers.jpg';
import Bb from '../assets/bb.jpg';
import Crown from '../assets/crown.jpg';
import DarkKnight from '../assets/DarkKnight.jpg';
import Gladiator from '../assets/Gladiator.jpg';
import Interstellar from '../assets/interstellar.jpg';
import Mandalorian from '../assets/Mandalorian.jpg';
import Matrix from '../assets/matrix.jpg';
import MoneyHeist from '../assets/moneyHeist.jpg';
import Stranger from '../assets/stranger.jpg';
import Wall from '../assets/wall.jpg';
import Witcher from '../assets/witcher.jpg';

export default function Dashboard() {
  // ----- MOVIE DATA (array of objects) -----
  const allMovies = [
    { id: 1, title: 'Inception', type: 'movie', year: 2010, genre: 'Sci-Fi', image: Inception, code: 27205},
    { id: 2, title: 'The Dark Knight', type: 'movie', year: 2008, genre: 'Action', image: DarkKnight, code: 155},
    { id: 3, title: 'Interstellar', type: 'movie', year: 2014, genre: 'Sci-Fi', image: Interstellar, code: 157336},
    { id: 4, title: 'The Matrix', type: 'movie', year: 1999, genre: 'Action', image: Matrix, code: 603 },
    { id: 5, title: 'Gladiator', type: 'movie', year: 2000, genre: 'Drama', image: Gladiator, code: 98},
    { id: 6, title: 'Avengers: Endgame', type: 'movie', year: 2019, genre: 'Action', image: Avengers, code: 299534},
    { id: 7, title: 'The Wolf of Wall Street', type: 'movie', year: 2013, genre: 'Drama', image: Wall, code: 106646},
    { id: 8, title: 'Stranger Things', type: 'series', year: 2016, genre: 'Sci-Fi', image: Stranger },
    { id: 9, title: 'The Crown', type: 'series', year: 2016, genre: 'Drama', image: Crown },
    { id: 10, title: 'Breaking Bad', type: 'series', year: 2008, genre: 'Drama', image: Bb },
    { id: 11, title: 'The Witcher', type: 'series', year: 2019, genre: 'Fantasy', image: Witcher },
    { id: 12, title: 'Money Heist', type: 'series', year: 2017, genre: 'Crime', image: MoneyHeist },
    { id: 13, title: 'The Mandalorian', type: 'series', year: 2019, genre: 'Sci-Fi', image: Mandalorian },
    { id: 14, title: 'Wednesday', type: 'series', year: 2022, genre: 'Comedy', image: Wednesday },
  ];

  // ----- STATES -----
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState(allMovies);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Filter movies based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setMovies(allMovies);
    } else {
      const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMovies(filtered);
    }
  }, [searchTerm]);

  // Filter movies & series
  const movieList = movies.filter(item => item.type === 'movie');
  const seriesList = movies.filter(item => item.type === 'series');

  // Slideshow movies (first 5)
  const slideshowMovies = allMovies.slice(0, 5);

  return (
    <div style={{ backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      {searchTerm ? (
        <>
          {movieList.length > 0 && (
            <MovieSection title="Movies" movies={movieList} />
          )}

          {seriesList.length > 0 && (
            <MovieSection title="Series" movies={seriesList} />
          )}
        </>
      ) : (
        <>
          <Slideshow movies={slideshowMovies} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />
          <MovieSection title="Movies" movies={movieList} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie}/>
          <MovieSection title="Series" movies={seriesList} selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie}/>
        </>
      )}
    </div>
  );
}