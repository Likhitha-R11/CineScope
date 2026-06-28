import React from 'react';
import MovieCard from './MovieCard';

export default function MovieGrid({ 
  movies, 
  title = '', 
  className = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  onAddToWatchlist,
  onRemoveFromWatchlist,
  watchlist = [],
  forceGrid = false // NEW PROP
}) {
  return (
    <div className="w-full px-4 md:px-8 lg:px-12 mt-8">
      {title && (
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
          {title}
        </h2>
      )}
      {movies?.length > 0 ? (
        (!forceGrid && movies.length > 0) ? (
          // Horizontal scroll for >30 movies unless forceGrid is true
          <div className="flex overflow-x-auto space-x-4 pb-2 hide-scrollbar">
            {movies.map((movie) =>
              movie?.id ? (
                <div key={movie.id} className="flex-shrink-0 w-40">
                  <MovieCard 
                    movie={movie} 
                    onAddToWatchlist={onAddToWatchlist}
                    onRemoveFromWatchlist={onRemoveFromWatchlist}
                    watchlist={watchlist}
                  />
                </div>
              ) : null
            )}
          </div>
        ) : (
          // Grid for <=30 movies or if forceGrid is true
          <div className={`grid gap-6 ${className}`}>
            {movies.map((movie) =>
              movie?.id ? (
                <div key={movie.id} className="transition-all duration-300 hover:z-10">
                  <MovieCard 
                    movie={movie} 
                    onAddToWatchlist={onAddToWatchlist}
                    onRemoveFromWatchlist={onRemoveFromWatchlist}
                    watchlist={watchlist}
                  />
                </div>
              ) : null
            )}
          </div>
        )
      ) : (
        <p className="text-gray-400 text-center">No movies available</p>
      )}
    </div>
  );
}



