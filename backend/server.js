const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// API Routes
app.get('/api/trending/movie', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/movie/day', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending movies:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

app.get('/api/trending/tv', async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/trending/tv/day', {
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                'accept': 'application/json'
            },
            params: {
                language: 'en-US'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching trending TV:', error.message);
        res.status(500).json({ error: 'Failed to fetch trending TV' });
    }
});

app.get('/api/search', async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const [movieResponse, tvResponse] = await Promise.all([
            axios.get('https://api.themoviedb.org/3/search/movie', {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                    'accept': 'application/json'
                },
                params: {
                    query,
                    include_adult: false,
                    language: 'en-US',
                    page: 1
                }
            }),
            axios.get('https://api.themoviedb.org/3/search/tv', {
                headers: {
                    'Authorization': `Bearer ${process.env.TMDB_API_TOKEN}`,
                    'accept': 'application/json'
                },
                params: {
                    query,
                    include_adult: false,
                    language: 'en-US',
                    page: 1
                }
            })
        ]);

        res.json({
            movies: movieResponse.data.results || [],
            tv: tvResponse.data.results || []
        });
    } catch (error) {
        console.error('Error searching:', error.message);
        res.status(500).json({ error: 'Failed to search' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});