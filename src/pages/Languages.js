import { useState } from "react";
import { motion } from "framer-motion";
import MovieGrid from "./Homecomponents/MovieGrid";

const languages = [
  "Telugu",
  "Hindi",
  "English",
  "Tamil",
  "Malayalam",
  "Kannada"
];

export default function Languages() {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLanguageClick = async (language) => {
    setSelectedLanguage(language);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/movies/by-language/${language}`);
      const data = await res.json();
      setMovies(data);
    } catch (err) {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      {!selectedLanguage ? (
        <>
          <h2 className="text-3xl font-bold text-white mb-4">Languages</h2>
          <p className="text-gray-400 mb-6">Explore movies in different languages.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {languages.map((language) => (
              <motion.button
                key={language}
                className="w-60 h-24 flex items-center justify-center rounded-xl text-white text-xl font-bold shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 focus:outline-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onClick={() => handleLanguageClick(language)}
              >
                {language}
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full max-w-7xl">
          <button
            onClick={() => {
              setSelectedLanguage(null);
              setMovies([]);
            }}
            className="mb-6 text-purple-400 hover:text-purple-300 flex items-center"
          >
            ← Back to Languages
          </button>
          <h3 className="text-2xl font-bold text-white mb-4">
            {selectedLanguage} Movies
          </h3>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <MovieGrid
              movies={movies}
              title={`Top ${selectedLanguage} Movies`}
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
              forceGrid={true}
            />
          )}
        </div>
      )}
    </div>
  );
}



