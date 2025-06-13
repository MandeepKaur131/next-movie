document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const movieGrid = document.getElementById('movie-grid');
    const baseURL = window.location.origin; 

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
                ? `${baseURL}/api/movies?query=${encodeURIComponent(query)}`
                : `${baseURL}/api/movies`;
            
            const response = await fetch(url);
            
            // Check for HTTP errors first
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch movies');
            }
            
            const data = await response.json();
            console.log("API Response:", data);
            
            displayMovies(data);
        } catch (error) {
            movieGrid.innerHTML = `
                <div class="error">
                    Search failed: ${error.message}<br>
                    <small>Try a different search term</small>
                </div>`;
            console.error('Fetch error:', error);
        }
    }

    function displayMovies(data) {
         if (data?.error) {
            movieGrid.innerHTML = `
                <div class="error">
                    ${data.error}<br>
                    <small>Try a different search term</small>
                </div>`;
            return;
        }
        // Extract movies array from response (handles both formats)
        const movies = Array.isArray(data) ? data : data?.results || [];
        
        if (!movies.length) {
            movieGrid.innerHTML = '<div class="no-results">No movies found. Try another search!</div>';
            return;
        }

        movieGrid.innerHTML = movies.map(movie => `
            <div class="movie-card glass-card" data-id="${movie.id}">
                <img src="${movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                    : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
                    alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.vote_average}/10</p>
            </div>
        `).join('');

        // Click handlers
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', () => {
                showMovieDetails(card.dataset.id);
            });
        });
    }

    // Show movie details modal
    async function showMovieDetails(movieId) {
        try {
            const response = await fetch(`${baseURL}/api/movies/${movieId}`);
            if (!response.ok) throw new Error("Failed to fetch movie details");
            const movie = await response.json();

            let trailerKey = null;
            try {
                const trailerResponse = await fetch(`${baseURL}/api/movies/${movieId}/videos`);
                const data = await trailerResponse.json();
                trailerKey = data?.key || null;
            } catch (e) {
                console.error('Trailer fetch error:', e);
            }
            
            // Populate modal
            document.getElementById('modal-title').textContent = movie.title;
            document.getElementById('modal-release').textContent = `Released: ${movie.release_date}`;
            document.getElementById('modal-rating').textContent = `Rating: ${movie.vote_average}/10 (${movie.vote_count} votes)`;
            document.getElementById('modal-runtime').textContent = `Runtime: ${movie.runtime} mins`;
            document.getElementById('modal-overview').textContent = movie.overview || 'No overview available.';
            
            const posterUrl = movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster';
            document.getElementById('modal-poster').src = posterUrl;
            
            // Show genres
            const genresContainer = document.querySelector('.modal-genres');
            genresContainer.innerHTML = movie.genres?.map(genre => 
                `<span class="genre-tag">${genre.name}</span>`
            ).join('') || 'No genres listed';

            // Trailer
            const trailerBtn = document.querySelector('.trailer-btn');
            if (trailerKey) {
                trailerBtn.style.display = 'block';
                trailerBtn.onclick = () => {
                    window.open(`https://youtube.com/watch?v=${trailerKey}`);
                };
            } else {
                trailerBtn.style.display = 'none';
            }
            
            // Display modal
            document.getElementById('movie-modal').style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            alert("Couldn't load movie details. Please try again.");
        }
    }

    // Close modal handlers
    document.querySelector('.close-btn')?.addEventListener('click', () => {
        document.getElementById('movie-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('movie-modal')) {
            document.getElementById('movie-modal').style.display = 'none';
        }
    });
});