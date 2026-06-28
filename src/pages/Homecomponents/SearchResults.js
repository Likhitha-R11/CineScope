import React from "react";
import { motion } from "framer-motion";

const SearchResults = ({ loading, searchResult, error }) => {
  return (
    <div className="mt-6 text-white w-full max-w-2xl mx-auto">
      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {searchResult && Object.keys(searchResult).length > 0 && !error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 border border-gray-700 rounded-lg shadow-lg bg-gray-900"
        >
          <h2 className="text-2xl font-bold text-blue-400 mb-2">{searchResult.movie_name || "Title not available"}</h2>
          <p className="text-gray-300"><strong>Year:</strong> {searchResult.year || "Unknown"}</p>
          <p className="text-gray-300"><strong>Language:</strong> {searchResult.languages || "Not specified"}</p>
          <p className="text-gray-300"><strong>Genre:</strong> {searchResult.genre || "Not listed"}</p>
          <p className="text-gray-300"><strong>Cast:</strong> {searchResult.cast || "No cast details"}</p>
          <p className="text-gray-400 mt-2"><strong>Description:</strong> {searchResult.overview || "No description available."}</p>
        </motion.div>
      )}

      {!loading && !error && (!searchResult || Object.keys(searchResult).length === 0) && (
        <p className="text-center text-gray-500">No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;

