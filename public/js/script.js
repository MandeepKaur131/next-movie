document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const movieGrid = document.getElementById('movie-grid');

    // Fetch popular movies on load
    fetchMovies();

    // Search button click handler
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchMovies(query);
        }
    });

    // Fetch movies from our backend
    async function fetchMovies(query = '') {
        try {
            movieGrid.innerHTML = '<div class="loading">Loading movies...</div>';
            
            const url = query 
                ? `/api/movies?query=${encodeURIComponent(query)}`
                : '/api/movies';
            
            const response = await fetch(url);
            const movies = await response.json();
            
            displayMovies(movies);
        } catch (error) {
            movieGrid.innerHTML = `<div class="error">Failed to load movies: ${error.message}</div>`;
            console.error('Error:', error);
        }
    }

    // Display movies in grid
    function displayMovies(movies) {
        if (!movies || movies.length === 0) {
            movieGrid.innerHTML = '<div class="no-results">No movies found. Try another search!</div>';
            return;
        }

        movieGrid.innerHTML = movies.map(movie => `
            <div class="movie-card glass-card">
                <img src="${movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                    : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
                    alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.vote_average}/10</p>
            </div>
        `).join('');
    }
});