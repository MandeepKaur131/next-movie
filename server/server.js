require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Verify config
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  TMDB_KEY_PRESENT: !!process.env.TMDB_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Route
app.get('/api/movies', handleMovieRequest);

async function handleMovieRequest(req, res) {
  try {
    const isSearch = req.query.query;
    const url = isSearch 
      ? 'https://api.themoviedb.org/3/search/movie'
      : 'https://api.themoviedb.org/3/movie/popular';

    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'en-US',
      page: 1
    };
    
    if (isSearch) {
      params.query = req.query.query;
      params.include_adult = false;
    }

    const response = await axios.get(url, { params });
    
    // Ensure we always return an array
    const movies = response.data.results || [];
    res.json(movies);
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // More detailed error response
    res.status(500).json({ 
      error: 'Movie fetch failed',
      details: error.response?.data?.status_message || error.message
    });
  }
}

app.get('/api/movies/:id', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: 'en-US'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Details Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

app.get('/api/movies/:id/videos', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${req.params.id}/videos`,
      { params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' } }
    );
    
    const trailers = response.data.results.filter(video => 
      video.type === "Trailer" && video.site === "YouTube"
    );
    
    // Return object with key instead of raw value
    res.json({ 
      success: true,
      key: trailers[0]?.key || null 
    });
    
  } catch (error) {
    console.error('Trailer Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch trailer' 
    });
  }
});

// Fallback Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});