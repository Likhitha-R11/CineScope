import { useState, useEffect } from "react";
import CsLogo from "./Homecomponents/cslogo";
import SearchBar from "./Homecomponents/searchbar";
import MovieGrid from "./Homecomponents/MovieGrid";
import { toast } from 'react-hot-toast';

export default function Home({ profile }) {
  const [popularMovies, setPopularMovies] = useState([]);
  const [watchlistMovies, setWatchlistMovies] = useState([]);
  const [, setLikedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReleases, setNewReleases] = useState([]);
  const [preferredMovies, setPreferredMovies] = useState([]);
  const [freeMovies, setFreeMovies] = useState([]);
  const [movies80s, setMovies80s] = useState([]);
  const [movies90s, setMovies90s] = useState([]);
  const [movies2000s, setMovies2000s] = useState([]);
  // Hindi & Telugu by decade
  const [movies80sHindi, setMovies80sHindi] = useState([]);
  const [movies90sHindi, setMovies90sHindi] = useState([]);
  const [movies2000sHindi, setMovies2000sHindi] = useState([]);
  const [movies80sTelugu, setMovies80sTelugu] = useState([]);
  const [movies90sTelugu, setMovies90sTelugu] = useState([]);
  const [movies2000sTelugu, setMovies2000sTelugu] = useState([]);

  // Track preferences and likes for re-fetching
  const [preferences, setPreferences] = useState({
    preferred_genres: [],
    preferred_languages: []
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Fetch user preferences from backend
  useEffect(() => {
    const fetchProfilePreferences = async () => {
      if (!profile) {
        setPreferences({ preferred_genres: [], preferred_languages: [] });
        setProfileLoaded(true);
        return;
      }
      // If profile has preferences, use them
      if (profile.preferred_genres || profile.preferred_languages) {
        setPreferences({
          preferred_genres: profile.preferred_genres || [],
          preferred_languages: profile.preferred_languages || []
        });
        setProfileLoaded(true);
        return;
      }
      // Otherwise, fetch from backend
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setPreferences({ preferred_genres: [], preferred_languages: [] });
          setProfileLoaded(true);
          return;
        }
        const res = await fetch('http://localhost:5000/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPreferences({
            preferred_genres: data.preferred_genres || [],
            preferred_languages: data.preferred_languages || []
          });
        } else {
          setPreferences({ preferred_genres: [], preferred_languages: [] });
        }
      } catch {
        setPreferences({ preferred_genres: [], preferred_languages: [] });
      }
      setProfileLoaded(true);
    };
    fetchProfilePreferences();
  }, [profile]);

  // Fetch all movies and user data
  useEffect(() => {
    if (!profileLoaded) return;

    const fetchPopularMovies = async () => {
      try {
        const response = await fetch("http://localhost:5000/movies/popular");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setPopularMovies(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchNewReleases = async () => {
      try {
        const res = await fetch("http://localhost:5000/movies/new-releases");
        const data = await res.json();
        setNewReleases(data);
      } catch (err) {
        setNewReleases([]);
      }
    };

    const fetchWatchlist = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setWatchlistMovies([]); // Explicitly set empty array if no token
      return;
    }
    const response = await fetch("http://localhost:5000/user/watchlist", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setWatchlistMovies(data);
    } else {
      setWatchlistMovies([]); // Set empty array if request fails
      console.error('Failed to fetch watchlist:', response.status);
    }
  } catch (error) {
    setWatchlistMovies([]); // Set empty array on error
    console.error('Watchlist fetch error:', error);
  }
};

    const fetchLikedAndRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLikedMovies([]);
          setRecommendations([]);
          return;
        }
        const res = await fetch("http://localhost:5000/user/likes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const liked = await res.json();
        setLikedMovies(liked);

        if (liked.length > 0) {
          const recRes = await fetch(
            `http://localhost:5000/recommend/more-like-this/${liked[0].id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          let recData = await recRes.json();

          const likedIds = liked.map((m) => m.id);
          recData = recData.filter((m) => !likedIds.includes(m.id));
          setRecommendations(recData);
        } else {
          setRecommendations([]);
        }
      } catch (err) {
        setLikedMovies([]);
        setRecommendations([]);
      }
    };

    // Fetch preferred movies based on BOTH genres AND languages
    const fetchPreferredMovies = async () => {
      let moviesSet = new Map();
      // If both genres and languages are selected, fetch intersection
      if (
        preferences.preferred_genres &&
        preferences.preferred_genres.length > 0 &&
        preferences.preferred_languages &&
        preferences.preferred_languages.length > 0
      ) {
        for (const genre of preferences.preferred_genres) {
          for (const lang of preferences.preferred_languages) {
            const res = await fetch(
              `http://localhost:5000/movies/by-genre-language?genre=${encodeURIComponent(
                genre
              )}&language=${encodeURIComponent(lang)}`
            );
            if (res.ok) {
              const data = await res.json();
              data.forEach((m) => moviesSet.set(m.id, m));
            }
          }
        }
      } else {
        // If only genres
        if (preferences.preferred_genres && preferences.preferred_genres.length > 0) {
          for (const genre of preferences.preferred_genres) {
            const res = await fetch(
              `http://localhost:5000/movies/by-genre/${encodeURIComponent(genre)}`
            );
            if (res.ok) {
              const data = await res.json();
              data.forEach((m) => moviesSet.set(m.id, m));
            }
          }
        }
        // If only languages
        if (preferences.preferred_languages && preferences.preferred_languages.length > 0) {
          for (const lang of preferences.preferred_languages) {
            const res = await fetch(
              `http://localhost:5000/movies/by-language/${encodeURIComponent(lang)}`
            );
            if (res.ok) {
              const data = await res.json();
              data.forEach((m) => moviesSet.set(m.id, m));
            }
          }
        }
      }
      setPreferredMovies(Array.from(moviesSet.values()).slice(0, 30));
    };

    const fetchFreeMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/movies/free");
        const data = await res.json();
        setFreeMovies(data);
      } catch (err) {
        setFreeMovies([]);
      }
    };

    const fetchMoviesByDecade = async (decade, setter) => {
      try {
        const res = await fetch(`http://localhost:5000/movies/by-decade/${decade}`);
        const data = await res.json();
        setter(data);
      } catch (err) {
        setter([]);
      }
    };

    // fetch by decade and language
    const fetchMoviesByDecadeLanguage = async (decade, language, setter) => {
      try {
        const res = await fetch(
          `http://localhost:5000/movies/by-decade-language/${decade}/${language}`
        );
        const data = await res.json();
        setter(data);
      } catch (err) {
        setter([]);
      }
    };

    setLoading(true);
    fetchPopularMovies();
    fetchWatchlist();
    fetchLikedAndRecommendations();
    fetchNewReleases();
    fetchPreferredMovies();
    fetchFreeMovies();
    // Order: 2000s, 90s, 80s
    fetchMoviesByDecade(2000, setMovies2000s);
    fetchMoviesByDecade(1990, setMovies90s);
    fetchMoviesByDecade(1980, setMovies80s);

    // Hindi
    fetchMoviesByDecadeLanguage(2000, "Hindi", setMovies2000sHindi);
    fetchMoviesByDecadeLanguage(1990, "Hindi", setMovies90sHindi);
    fetchMoviesByDecadeLanguage(1980, "Hindi", setMovies80sHindi);
    // Telugu
    fetchMoviesByDecadeLanguage(2000, "Telugu", setMovies2000sTelugu);
    fetchMoviesByDecadeLanguage(1990, "Telugu", setMovies90sTelugu);
    fetchMoviesByDecadeLanguage(1980, "Telugu", setMovies80sTelugu);

    setLoading(false);
    // eslint-disable-next-line
  }, [profileLoaded, preferences]);

  // Re-fetch liked/recommendations when a like/dislike happens
  const handleAddToWatchlist = async (movieId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add to watchlist');
      return;
    }
    
    // Get current profile index (you'll need to track this in state)
    const profileIdx = 0; // Default to first profile or get from state
    
    const response = await fetch(`http://localhost:5000/user/watchlist/${profileIdx}/${movieId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      // Fetch updated watchlist
      const watchlistRes = await fetch(`http://localhost:5000/user/watchlist/${profileIdx}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const watchlistData = await watchlistRes.json();
      
      toast.success('Added to watchlist!');
      setWatchlistMovies(watchlistData);
    } else {
      const error = await response.json();
      toast.error(error.error || 'Failed to add to watchlist');
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
    console.error('Watchlist error:', error);
  }
};

  const handleRemoveFromWatchlist = async (movieId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to manage watchlist');
      return;
    }

    // Get current profile index (you might need to track this in state)
    const profileIdx = 0; // Default to first profile or get from state

    const response = await fetch(
      `http://localhost:5000/user/watchlist/${profileIdx}/${movieId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      // Fetch updated watchlist to update state
      const watchlistRes = await fetch(
        `http://localhost:5000/user/watchlist/${profileIdx}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const watchlistData = await watchlistRes.json();
      
      toast.success('Removed from watchlist');
      setWatchlistMovies(watchlistData);
    } else {
      const error = await response.json();
      toast.error(error.error || 'Failed to remove from watchlist');
    }
  } catch (error) {
    toast.error('Network error. Please try again.');
    console.error('Watchlist removal error:', error);
  }
};

  // Listen for preference/like changes in localStorage (Settings or Like/Dislike)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'preferences_updated' || e.key === 'liked_updated') {
        // Force re-fetch preferences and liked movies
        setProfileLoaded(false);
        setTimeout(() => setProfileLoaded(true), 100);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const watchlistIds = watchlistMovies.map(movie => movie.id);
  const currentYear = new Date().getFullYear();

  // Flashy heading helper
  const SectionHeading = ({ children, className = "" }) => (
    <h2
      className={
        "text-2xl md:text-3xl font-extrabold mb-6 text-center tracking-wider drop-shadow-lg " +
        className
      }
    >
      {children}
    </h2>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <CsLogo />
          <SearchBar />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">
            <SectionHeading className="text-red-400">⚠️ Failed to load popular movies</SectionHeading>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        ) : (
          <>
            {/* You Might Prefer This */}
            {preferredMovies.length > 0 && (
              <div className="mb-12">
                <SectionHeading className="text-purple-400 animate-pulse">
                  💡 You Might Prefer This
                </SectionHeading>
                <MovieGrid
                  movies={preferredMovies}
                  onAddToWatchlist={handleAddToWatchlist}
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  watchlist={watchlistIds}
                />
              </div>
            )}

            {/* You Might Like This */}
            {recommendations.length > 0 && (
              <div className="mb-12">
                <SectionHeading className="text-pink-400 animate-bounce">
                  ⭐ You Might Like This
                </SectionHeading>
                <MovieGrid
                  movies={recommendations}
                  onAddToWatchlist={handleAddToWatchlist}
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  watchlist={watchlistIds}
                />
              </div>
            )}

            {profile?.is_child ? (
              <div className="mt-8">
                <SectionHeading className="text-yellow-300 animate-pulse">
                  🧸 Kids Friendly Movies
                </SectionHeading>
                <MovieGrid
                  movies={popularMovies.filter(movie =>
                    movie.genres?.includes('Animation') ||
                    movie.genres?.includes('Family')
                  )}
                  onAddToWatchlist={handleAddToWatchlist}
                  onRemoveFromWatchlist={handleRemoveFromWatchlist}
                  watchlist={watchlistIds}
                />
              </div>
            ) : (
              <>
                {watchlistMovies.length > 0 && (
                  <div className="mt-8">
                    <SectionHeading className="text-blue-300 animate-pulse">
                      📺 Your Watchlist
                    </SectionHeading>
                    <MovieGrid
                      movies={watchlistMovies}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* Free Movies Section */}
                {freeMovies.length > 0 && (
                  <div className="mt-8">
                    <SectionHeading className="text-green-400 animate-bounce">
                       ✨Free Movies✨
                    </SectionHeading>
                    <MovieGrid
                      movies={freeMovies}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                <div className="mt-8">
                  <SectionHeading className="text-purple-300 animate-pulse">
                    🏆 Most Voted Movies
                  </SectionHeading>
                  <MovieGrid
                    movies={popularMovies}
                    onAddToWatchlist={handleAddToWatchlist}
                    onRemoveFromWatchlist={handleRemoveFromWatchlist}
                    watchlist={watchlistIds}
                  />
                </div>

                <div className="mt-12">
                  <SectionHeading className="text-white animate-bounce">
                    🌟 New Releases ({currentYear})
                  </SectionHeading>
                  {newReleases.length > 0 ? (
                    <MovieGrid
                      movies={newReleases}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  ) : (
                    <div className="text-gray-400 text-center py-8">
                      No movies available for this year.
                    </div>
                  )}
                </div>

                {/* 2000s Movies Section */}
                {movies2000s.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-blue-400 animate-pulse">
                      🚀 Blockbusters of the 2000's 🚀
                    </SectionHeading>
                    <MovieGrid
                      movies={movies2000s}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 2000s Hindi Movies */}
                {movies2000sHindi.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-red-400 animate-bounce">
                      🎬 2000's Bollywood Blockbusters
                    </SectionHeading>
                    <MovieGrid
                      movies={movies2000sHindi}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 2000s Telugu Movies */}
                {movies2000sTelugu.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-green-400 animate-pulse">
                      🎥 2000's Telugu Hits
                    </SectionHeading>
                    <MovieGrid
                      movies={movies2000sTelugu}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 90s Movies Section */}
                {movies90s.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-yellow-300 animate-bounce">
                      🌟 Iconic 90's Hits 🌟
                    </SectionHeading>
                    <MovieGrid
                      movies={movies90s}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 90s Hindi Movies */}
                {movies90sHindi.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-red-400 animate-pulse">
                      🎬 90's Hindi Blockbusters
                    </SectionHeading>
                    <MovieGrid
                      movies={movies90sHindi}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 90s Telugu Movies */}
                {movies90sTelugu.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-green-400 animate-bounce">
                      🎥 90's Tollywood Hits
                    </SectionHeading>
                    <MovieGrid
                      movies={movies90sTelugu}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 80s Movies Section */}
                {movies80s.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-pink-400 animate-pulse">
                      ✨ Timeless 80's Classics ✨
                    </SectionHeading>
                    <MovieGrid
                      movies={movies80s}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 80s Hindi Movies */}
                {movies80sHindi.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-red-400 animate-bounce">
                      🎬 80's Bollywood Blockbusters
                    </SectionHeading>
                    <MovieGrid
                      movies={movies80sHindi}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}

                {/* 80s Telugu Movies */}
                {movies80sTelugu.length > 0 && (
                  <div className="mt-12">
                    <SectionHeading className="text-green-400 animate-pulse">
                      🎥 80's Tollywood Hits
                    </SectionHeading>
                    <MovieGrid
                      movies={movies80sTelugu}
                      onAddToWatchlist={handleAddToWatchlist}
                      onRemoveFromWatchlist={handleRemoveFromWatchlist}
                      watchlist={watchlistIds}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}



