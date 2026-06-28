import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PersonCard from "../components/PersonCard";
import MovieGrid from "./Homecomponents/MovieGrid";
import { FaThumbsUp, FaThumbsDown, FaBookmark, FaRegBookmark, FaPlay } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [liked, setLiked] = useState(null); // null = neutral, true = liked, false = disliked
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [showWatchMovie, setShowWatchMovie] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`http://localhost:5000/movies/${id}`);
        const data = await response.json();
        setMovie(data);

        // Fetch similar movies
        setLoadingSimilar(true);
        const similarResponse = await fetch(`http://localhost:5000/recommend/more-like-this/${id}`);
        const similarData = await similarResponse.json();
        setSimilarMovies(similarData);
      } catch (error) {
        // silent
      } finally {
        setLoading(false);
        setLoadingSimilar(false);
      }
    };

    fetchMovie();
  }, [id]);

  useEffect(() => {
    const fetchLikes = async () => {
      const token = localStorage.getItem('token');
      if (!token || !movie) return setLiked(null);
      const res = await fetch('http://localhost:5000/user/likes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const likedMovies = await res.json();
      if (likedMovies.some(m => m.id === movie.id)) {
        setLiked(true);
      } else {
        setLiked(null); // neutral by default
      }
    };
    fetchLikes();
  }, [movie]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      const token = localStorage.getItem('token');
      if (!token || !movie) return setIsInWatchlist(false);
      const res = await fetch('http://localhost:5000/user/watchlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const watchlist = await res.json();
      setIsInWatchlist(watchlist.some(m => m.id === movie.id));
    };
    fetchWatchlist();
  }, [movie]);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error("Login to like movies!");
    await fetch(`http://localhost:5000/user/like/${movie.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    setLiked(true);
    toast.success("Added to your likes!");
  };

  const handleDislike = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error("Login to dislike movies!");
    await fetch(`http://localhost:5000/user/dislike/${movie.id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    setLiked(false);
    toast.success("Marked as not liked.");
  };

  const handleWatchlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return toast.error("Login to use watchlist!");
    if (isInWatchlist) {
      await fetch(`http://localhost:5000/user/watchlist/${movie.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInWatchlist(false);
      toast.success("Removed from watchlist");
    } else {
      await fetch(`http://localhost:5000/user/watchlist/${movie.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsInWatchlist(true);
      toast.success("Added to watchlist!");
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;
  if (!movie) return <div className="text-white text-center py-20">Movie not found</div>;

  // Extract YouTube ID from URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const trailerId = movie.trailer_url ? getYouTubeId(movie.trailer_url) : null;
  const movieUrlId = movie.movie_url ? getYouTubeId(movie.movie_url) : null;
  const isFreeMovie = movie.movie_url && movie.movie_url.length > 0;

  // If user clicked "Watch Movie", show only the movie player
  if (showWatchMovie && isFreeMovie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 w-full flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full mx-auto">
          <button
            onClick={() => setShowWatchMovie(false)}
            className="mb-4 px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
          >
            ← Back to Details
          </button>
          <h2 className="text-2xl font-bold mb-4 text-center">{movie.title} - Watch Movie</h2>
          {movieUrlId ? (
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${movieUrlId}`}
                title={`${movie.title} Full Movie`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-96 rounded-lg"
              ></iframe>
            </div>
          ) : (
            <a
              href={movie.movie_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Watch Now
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 w-full">
      <div className="max-w-7xl mx-auto w-full px-4">
        <Link to="/" className="inline-block mb-6 text-purple-400 hover:text-purple-300">
          ← Back to Home
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-1/3 lg:w-1/4 relative">
            <img
              src={movie.poster_path || "https://via.placeholder.com/300x450"}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x450";
              }}
            />
            {/* Watchlist Icon */}
            <button
              onClick={handleWatchlist}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80"
              title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlist ? <FaBookmark className="text-yellow-400 text-2xl" /> : <FaRegBookmark className="text-2xl" />}
            </button>
          </div>
          
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
            <h1 className="text-4xl font-bold mb-2 break-words">
              {movie.title} {movie.release_year && `(${movie.release_year})`}
            </h1>

            {/* Like/Dislike Buttons */}
            <div className="flex gap-4 items-center my-2">
              <button
                onClick={handleLike}
                className={`p-2 rounded-full border-2 transition-colors ${
                  liked === true
                    ? "bg-green-600 border-green-600"
                    : "bg-gray-800 border-gray-600 hover:border-green-500"
                }`}
                title="Like"
              >
                <FaThumbsUp className={liked === true ? "text-white" : "text-gray-400"} />
              </button>
              <button
                onClick={handleDislike}
                className={`p-2 rounded-full border-2 transition-colors ${
                  liked === false
                    ? "bg-red-600 border-red-600"
                    : "bg-gray-800 border-gray-600 hover:border-red-500"
                }`}
                title="Not Like"
              >
                <FaThumbsDown className={liked === false ? "text-white" : "text-gray-400"} />
              </button>
            </div>
            
            {movie.tagline && <p className="text-gray-400 italic mb-4 break-words">"{movie.tagline}"</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((genre, index) => (
                <span key={index} className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>

            {/* Make overview fit page and not overflow */}
            <div className="mb-6">
              <p className="text-lg break-words whitespace-pre-line w-full max-w-full overflow-wrap break-word">
                {movie.overview}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Details</h3>
                {movie.runtime && <p className="mb-2"><span className="text-gray-400">Runtime:</span> {movie.runtime} mins</p>}
                {movie.vote_average && <p className="mb-2"><span className="text-gray-400">Rating:</span> {movie.vote_average.toFixed(1)}/10</p>}
                {movie.release_year && <p><span className="text-gray-400">Release Year:</span> {movie.release_year}</p>}
              </div>

              {movie.director && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Director</h3>
                  <PersonCard person={movie.director} />
                </div>
              )}
            </div>

            {/* Trailer Section */}
            {trailerId && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Trailer</h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}`}
                    title={`${movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-64 md:h-96 rounded-lg"
                  ></iframe>
                </div>
              </div>
            )}

            {/* Watch Movie Button */}
            {isFreeMovie && (
              <div className="mb-8">
                <button
                  onClick={() => setShowWatchMovie(true)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <FaPlay /> Watch Movie
                </button>
              </div>
            )}
          </div>
        </div>

        {movie.cast?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movie.cast.map((person) => (
                <div key={person.id} className="text-center">
                  <PersonCard person={person} />
                  <p className="text-gray-400 text-sm mt-2">
                    as {person.character || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* More Like This section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
          {loadingSimilar ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <MovieGrid 
              movies={similarMovies} 
              className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            />
          )}
        </div>
      </div>
    </div>
  );
}




