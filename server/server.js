require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public
app.use(express.static('public'));

// TMDB API Proxy
app.get('/api/movies', async (req, res) => {
    try {
        const { query } = req.query;
        const url = query 
            ? `https://api.themoviedb.org/3/search/movie?query=${query}`
            : 'https://api.themoviedb.org/3/movie/popular';
        
        const response = await axios.get(url, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US'
            }
        });
        
        res.json(response.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✨ Server running on port ${PORT}`));