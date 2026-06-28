import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

export default function MovieCard({ movie, onAddToWatchlist, onRemoveFromWatchlist, watchlist = [], selectedId, onSelect }) {
  if (!movie?.id) return null;

  const isInWatchlist = watchlist.includes(movie.id);
  const isSelected = selectedId === movie.id;

  const handleWatchlistAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      onRemoveFromWatchlist?.(movie.id);
    } else {
      onAddToWatchlist?.(movie.id);
    }
  };

  // Click handler for selection
  const handleSelect = (e) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(movie.id);
    }
  };

  return (
    <Link to={`/movie/${movie.id}`}>
      <motion.div
        className={`relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer`}
        whileHover={{
          scale: 1.05,
          boxShadow: isSelected
            ? "0 0 32px 8px #a855f7, 0 0 60px 16px #ec4899"
            : "0 0 18px 2px #a855f7, 0 0 32px 6px #ec4899"
        }}
        animate={isSelected ? { scale: 1.04 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={handleSelect}
        style={{
          background: isSelected
            ? "linear-gradient(135deg, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.22) 100%)"
            : "rgba(0,0,0,0.7)",
          boxShadow: isSelected
            ? "0 0 32px 8px #a855f7, 0 0 60px 16px #ec4899"
            : undefined,
          border: isSelected ? "2px solid #a855f7" : "2px solid transparent"
        }}
      >
        <div className="aspect-[2/3] w-full">
          <img
            src={movie.poster_path || "https://via.placeholder.com/300x450"}
            alt={movie.title || "Movie poster"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x450";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWatchlistAction}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
            title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
          >
            {isInWatchlist ? <FaBookmark className="text-yellow-400" /> : <FaRegBookmark />}
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          <h3 className="text-white font-medium text-xs text-center line-clamp-2">
            {movie.title || "Untitled Movie"}
          </h3>
          <div className="flex justify-center mt-1 space-x-1">
            <span className="text-yellow-400 text-[10px]">
              ★ {movie.vote_average?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-gray-300 text-[10px]">
              {movie.release_year || ''}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}



