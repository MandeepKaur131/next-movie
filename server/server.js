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
    const type = req.query.query ? 'search' : 'popular';
    const url = `https://api.themoviedb.org/3/movie/${type === 'search' ? 'search' : 'popular'}`;
    
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'en-US'
    };
    if (req.query.query) params.query = req.query.query;

    const response = await axios.get(url, { params });
    res.json(response.data.results);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Movie fetch failed' });
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

// Fallback Route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});