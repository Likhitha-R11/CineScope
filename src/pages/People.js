import { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaMicrophone } from "react-icons/fa";
import PersonCard from "../components/PersonCard";
import { toast } from 'react-hot-toast'; // Toast notification for voice

export default function People() {
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);

  const fetchPeople = async (query) => {
    const endpoint = query.trim()
      ? `http://localhost:5000/people/search?q=${query}`
      : "http://localhost:5000/people/popular";

    try {
      setLoading(true);
      const response = await fetch(endpoint);
      const data = await response.json();
      setPeople(data);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPeople(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();
    setListening(true);
    toast.success('🎤 Listening...', { duration: 2000 });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Voice recognition error');
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      toast.dismiss();
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {searchQuery ? `Search Results` : "People of Cinema"}
          </h1>

          <div className="relative w-full max-w-md">
            <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-white ml-1"
                  title="Clear"
                >
                  <FaTimes />
                </button>
              )}
              <button
                onClick={handleVoiceInput}
                className={`text-gray-400 hover:text-white ml-2 ${listening ? 'animate-spin text-red-400' : ''}`}
                title="Voice Search"
              >
                <FaMicrophone />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : people.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {people.map((person) => (
              <div key={person.id} className="flex flex-col items-center">
                <PersonCard person={person} />
                {person.movie_count && (
                  <p className="text-gray-400 text-xs mt-1">
                    {person.movie_count} movies
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-10">
            {searchQuery ? "No results found." : "Loading people..."}
          </p>
        )}
      </div>
    </div>
  );
}



