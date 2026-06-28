import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaMicrophone } from 'react-icons/fa';
import MovieCard from './MovieCard';
import { toast } from 'react-hot-toast';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Voice setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Browser does not support voice search.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      toast.loading('🎤 Listening...', { id: 'voice-toast' });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const combined = finalTranscript || interimTranscript;
      setQuery(combined);

      if (finalTranscript.trim()) {
        fetchResults(finalTranscript);
      }
    };

    recognition.onerror = (e) => {
      toast.error(`Voice error: ${e.error}`, { id: 'voice-toast' });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      toast.dismiss('voice-toast');
    };

    recognitionRef.current = recognition;
  }, []);

  // Typing triggers search after 400ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        fetchResults(query);
      } else {
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  const fetchResults = async (q) => {
    try {
      const res = await fetch(`http://localhost:5000/movies/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Error fetching:', err);
      toast.error('Search failed.');
    }
  };

  const handleMicClick = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    } else if (isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="relative">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 shadow-lg">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies (type or speak)..."
            className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
          />
          {query && (
            <button onClick={clearSearch} className="text-gray-400 hover:text-white ml-2" title="Clear">
              <FaTimes />
            </button>
          )}
          <button
            onClick={handleMicClick}
            disabled={isListening}
            className={`ml-2 ${
              isListening ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'
            }`}
            title="Voice Search"
          >
            <FaMicrophone />
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center text-gray-400 mt-4">No results found.</div>
      )}
    </div>
  );
}

