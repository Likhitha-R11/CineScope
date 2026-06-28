import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import MovieGrid from './Homecomponents/MovieGrid';
import { motion } from 'framer-motion';

export default function Browse() {
    const { user, logout } = useAuth();
    const [popularMovies, setPopularMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await fetch("http://localhost:5000/movies/popular");
                const data = await response.json();
                setPopularMovies(data);
            } catch (error) {
                console.error("Error fetching popular movies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularMovies();
    }, []);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        let scrollInterval;

        if (scrollContainer && popularMovies.length > 0) {
            scrollInterval = setInterval(() => {
                setScrollPosition(prev => {
                    const newPosition = prev + 1;
                    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                    
                    if (newPosition >= maxScroll) {
                        return 0;
                    }
                    return newPosition;
                });
                
                scrollContainer.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }, 50);

            return () => clearInterval(scrollInterval);
        }
    }, [popularMovies, scrollPosition]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="relative h-screen overflow-hidden">
                {/* Hero Section with auto-scrolling movies */}
                <div className="absolute inset-0 z-0">
                    <div 
                        ref={scrollRef}
                        className="flex h-full items-center overflow-x-auto hide-scrollbar"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {popularMovies.map((movie, index) => (
                            <motion.div
                                key={movie.id}
                                className="flex-shrink-0 h-full px-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="h-full w-64 md:w-80 lg:w-96 relative group">
                                    <img
                                        src={movie.backdrop_path || movie.poster_path || "https://via.placeholder.com/500x281"}
                                        alt={movie.title}
                                        className="h-full w-full object-cover rounded-lg brightness-50 group-hover:brightness-75 transition-all duration-300"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                        <h2 className="text-xl font-bold">{movie.title}</h2>
                                        <p className="text-sm text-gray-300 line-clamp-2">{movie.overview}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                
                {/* Content overlay */}
                <div className="relative z-10 h-full flex flex-col bg-gradient-to-b from-black/30 via-black/10 to-black/80">
                    <div className="p-6 flex justify-between items-center">
                        <div className="text-2xl font-bold">CineScope</div>
                        <button 
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                    
                    <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome, {user?.name}</h1>
                            <p className="text-xl mb-8">Discover your next favorite movie</p>
                            <div className="flex justify-center gap-4">
                                <button className="px-6 py-3 bg-purple-600 rounded-md hover:bg-purple-700 transition-colors font-medium">
                                    Browse Movies
                                </button>
                                <button className="px-6 py-3 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors font-medium">
                                    My List
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            {/* Movie categories below */}
            <div className="container mx-auto px-4 py-12">
                <MovieGrid 
                    movies={popularMovies.slice(0, 10)} 
                    title="Popular on CineScope"
                    className="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                />
            </div>
        </div>
    );
}



