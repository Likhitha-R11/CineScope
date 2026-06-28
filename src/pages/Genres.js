import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MovieGrid from "./Homecomponents/MovieGrid";

export default function Genres() {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const genres = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "Thriller", "War", "Western"
  ];

  useEffect(() => {
    if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre);
    }
  }, [selectedGenre]);

  const fetchMoviesByGenre = async (genre) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/movies/by-genre/${genre.toLowerCase().replace(' ', '')}`
      );
      const data = await response.json();
      setGenreMovies(data);
    } catch (error) {
      console.error("Error fetching genre movies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      {!selectedGenre ? (
        <>
          <h2 className="text-3xl font-bold text-white mb-4">Genres</h2>
          <p className="text-gray-400 mb-6">Browse movies by genre</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {genres.map((genre) => (
              <motion.div
                key={genre}
                className={`w-60 h-24 flex items-center justify-center 
                           rounded-xl text-white text-xl font-bold shadow-lg 
                           bg-gradient-to-r from-blue-500 to-cyan-500`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(56, 182, 255, 0.6)" // Subtle glow
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut",
                  y: { type: "spring", stiffness: 300, damping: 15 }
                }}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full max-w-7xl">
          <button 
            onClick={() => setSelectedGenre(null)}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center"
          >
            ← Back to Genres
          </button>
          <h3 className="text-2xl font-bold text-white mb-4">
            {selectedGenre} Movies
          </h3>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <MovieGrid 
              movies={genreMovies} 
              title={`Top ${selectedGenre} Movies`}
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              forceGrid={true}
            />
          )}
        </div>
      )}
    </div>
  );
}


