import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMicrophone,
  FaPaperPlane,
  FaFilm,
  FaThumbsUp,
  FaThumbsDown,
  FaExpand,
  FaCompress,
  FaRobot,
  FaRegCommentDots
} from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
// Removed: import { MdOpenWith } from 'react-icons/md';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

// Helper: basic NLP for extracting preferences
const extractPreferences = (text, prevPrefs = {}) => {
  const genres = [
    "action", "adventure", "animation", "comedy", "crime", "documentary", "drama",
    "family", "fantasy", "history", "horror", "music", "mystery", "romance",
    "science fiction", "scifi", "thriller", "war", "western"
  ];
  const genreRegex = new RegExp(genres.join("|"), "i");
  const peopleRegex = /(?:with|of|by|starring|featuring|with actor|with actress|with director)\s+([a-zA-Z\s]+)/i;
  const notRegex = /not\s+([a-zA-Z\s]+)/i;
  const likeRegex = /like\s+([a-zA-Z\s]+)/i;
  const hateRegex = /hate\s+([a-zA-Z\s]+)/i;

  let newPrefs = { ...prevPrefs };

  // Genre extraction
  const genreMatch = text.match(genreRegex);
  if (genreMatch) {
    newPrefs.genre = genreMatch[0].toLowerCase();
  }

  // People extraction (positive)
  const peopleMatch = text.match(peopleRegex) || text.match(likeRegex);
  if (peopleMatch && peopleMatch[1]) {
    newPrefs.person = peopleMatch[1].trim();
  }

  // People extraction (negative)
  const notMatch = text.match(notRegex) || text.match(hateRegex);
  if (notMatch && notMatch[1]) {
    newPrefs.not_person = notMatch[1].trim();
  }

  // Greetings (only if the whole message is a greeting)
  if (/^(hello|hi|hey|namaste|yo|sup|good morning|good evening)[.! ]*$/i.test(text.trim())) {
    newPrefs.greeting = true;
  } else {
    newPrefs.greeting = false;
  }

  return newPrefs;
};

// Adjusted max size for expand (responsive, not more than 90vw/vh)
const MIN_WIDTH = 320;
const MIN_HEIGHT = 320;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 700;

// Chatbot name
const CHATBOT_NAME = "cinebot";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(340);
  const [height, setHeight] = useState(500);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 340, height: 500 });
  const [resizeDir, setResizeDir] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm CineScope AI. You can ask me things like:",
      isBot: true,
      examples: [
        "Show me action movies",
        "Recommend romantic comedies",
        "I like feel-good movies with Tom Hanks",
        "What are the best sci-fi films from the 80s?",
        "Suggest something similar to Inception"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionPrefs, setSessionPrefs] = useState({});
  const [feedback, setFeedback] = useState({});
  const [recFeedback, setRecFeedback] = useState({});
  const messagesEndRef = useRef(null);
  const { user } = useUser();
  const recognitionRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, width, height]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Like/dislike feedback for each bot answer
  const handleBotFeedback = (msgIdx, value) => {
    setFeedback(prev => ({ ...prev, [msgIdx]: value }));
  };

  // Like/dislike feedback for recommendations (after movie list)
  const handleRecFeedback = (msgIdx, value) => {
    setRecFeedback(prev => ({ ...prev, [msgIdx]: value }));
  };

  const handleSend = async (text = inputText) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, {
      text: text,
      isBot: false
    }]);
    setInputText('');

    // Extract preferences and update session
    const newPrefs = extractPreferences(text, sessionPrefs);
    setSessionPrefs(newPrefs);

    // Handle greetings (only if not a movie query)
    if (newPrefs.greeting && !newPrefs.genre && !newPrefs.person && !newPrefs.not_person) {
      setMessages(prev => [...prev, {
        text: "Hello! 👋 What kind of movies are you in the mood for?",
        isBot: true
      }]);
      return;
    }

    try {
      setIsTyping(true);
      setMessages(prev => [...prev, {
        text: "Typing...",
        isBot: true,
        isTyping: true
      }]);

      // Build query for backend
      const queryPayload = {
        query: text,
        user_id: user?._id,
        preferences: newPrefs
      };

      const response = await fetch('http://localhost:5000/recommend/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryPayload)
      });

      const data = await response.json();

      setMessages(prev => prev.filter(msg => !msg.isTyping));
      setIsTyping(false);

      if (data.results && data.results.length > 0) {
        let recText = data.message || "Here are some recommendations:";
        if (newPrefs.genre && newPrefs.person && newPrefs.not_person) {
          recText = `Here are some ${newPrefs.genre} movies with ${newPrefs.person}, but not with ${newPrefs.not_person}:`;
        } else if (newPrefs.genre && newPrefs.person) {
          recText = `Here are some ${newPrefs.genre} movies with ${newPrefs.person}:`;
        } else if (newPrefs.genre && newPrefs.not_person) {
          recText = `Here are some ${newPrefs.genre} movies without ${newPrefs.not_person}:`;
        } else if (newPrefs.genre) {
          recText = `Here are some ${newPrefs.genre} movies:`;
        } else if (newPrefs.person) {
          recText = `Here are some movies with ${newPrefs.person}:`;
        } else if (newPrefs.not_person) {
          recText = `Here are some movies without ${newPrefs.not_person}:`;
        }

        setMessages(prev => [...prev, {
          text: recText,
          isBot: true,
          movies: data.results,
          found_genres: data.found_genres || [],
          found_people: data.found_people || []
        }]);
      } else {
        setMessages(prev => [...prev, {
          text: "I couldn't find matching movies. Try being more specific or ask differently!",
          isBot: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I encountered an error. Please try again.",
        isBot: true,
        isError: true
      }]);
      setIsTyping(false);
    }
  };

  // Voice Input Handler
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  // Resize logic for all four sides and corners
  const handleResizeStart = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setResizeDir(dir);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height
    });
    document.body.style.userSelect = 'none';
  };

  const handleResizeMove = (e) => {
    if (!dragging || !resizeDir || isMaximized) return;
    let dx = e.clientX - dragStart.x;
    let dy = e.clientY - dragStart.y;
    let newWidth = width;
    let newHeight = height;
    if (resizeDir === 'right') newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStart.width + dx));
    if (resizeDir === 'left') newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, dragStart.width - dx));
    if (resizeDir === 'bottom') newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragStart.height + dy));
    if (resizeDir === 'top') newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, dragStart.height - dy));
    setWidth(newWidth);
    setHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setDragging(false);
    setResizeDir(null);
    document.body.style.userSelect = '';
  };

  // Maximize/minimize logic
  const handleMaximize = () => {
    if (!isMaximized) {
      setWidth(MAX_WIDTH);
      setHeight(MAX_HEIGHT);
      setIsMaximized(true);
    } else {
      setWidth(340);
      setHeight(500);
      setIsMaximized(false);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    } else {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
    // eslint-disable-next-line
  }, [dragging, resizeDir, dragStart, width, height, isMaximized]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              minWidth: MIN_WIDTH,
              minHeight: MIN_HEIGHT,
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative'
            }}
            className="bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-700 overflow-hidden transition-all duration-300 select-none"
          >
            {/* Chatbot name at the top */}
            <div className="w-full text-center py-1 bg-gray-900">
              <span className="text-xs text-purple-300 tracking-widest font-semibold uppercase">{CHATBOT_NAME}</span>
            </div>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 flex justify-between items-center cursor-move">
              <div className="flex items-center gap-2">
                <span className="bg-white rounded-full p-1 shadow-lg">
                  <FaRobot className="text-purple-600 text-2xl" title="Cinebot" />
                </span>
                <h3 className="text-white font-bold tracking-wide">CineScope AI</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMaximize}
                  className="text-white hover:text-gray-200"
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200"
                >
                  <IoMdClose size={20} />
                </button>
              </div>
            </div>
            {/* Resize handles (edges only) */}
            <>
              {/* Sides */}
              <div
                onMouseDown={e => handleResizeStart(e, 'top')}
                style={{ position: 'absolute', top: -6, left: 0, right: 0, height: 12, cursor: 'ns-resize', zIndex: 50 }}
              />
              <div
                onMouseDown={e => handleResizeStart(e, 'bottom')}
                style={{ position: 'absolute', bottom: -6, left: 0, right: 0, height: 12, cursor: 'ns-resize', zIndex: 50 }}
              />
              <div
                onMouseDown={e => handleResizeStart(e, 'left')}
                style={{ position: 'absolute', left: -6, top: 0, bottom: 0, width: 12, cursor: 'ew-resize', zIndex: 50 }}
              />
              <div
                onMouseDown={e => handleResizeStart(e, 'right')}
                style={{ position: 'absolute', right: -6, top: 0, bottom: 0, width: 12, cursor: 'ew-resize', zIndex: 50 }}
              />
            </>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 ${msg.isBot ? 'text-left' : 'text-right'}`}
                >
                  <div className={`inline-block max-w-xs p-3 rounded-lg ${
                    msg.isBot ?
                      (msg.isError ? 'bg-red-900 text-white' :
                        msg.isTyping ? 'bg-gray-700 text-gray-400 italic' : 'bg-gray-700 text-white') :
                      'bg-blue-600 text-white'
                  }`}>
                    {msg.text}

                    {/* Show examples */}
                    {msg.examples && (
                      <div className="mt-2 text-sm text-gray-300">
                        {msg.examples.map((ex, i) => (
                          <div key={i}>• {ex}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Like/Dislike for bot answer */}
                  {msg.isBot && !msg.isTyping && (
                    <div className="flex gap-2 mt-1">
                      <button
                        className={`bg-transparent p-1 rounded-full ${feedback[i] === 'like' ? 'text-green-500' : 'text-gray-400'}`}
                        onClick={() => handleBotFeedback(i, 'like')}
                        title="Like this answer"
                      >
                        <FaThumbsUp />
                      </button>
                      <button
                        className={`bg-transparent p-1 rounded-full ${feedback[i] === 'dislike' ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={() => handleBotFeedback(i, 'dislike')}
                        title="Dislike this answer"
                      >
                        <FaThumbsDown />
                      </button>
                    </div>
                  )}

                  {/* Show movie results */}
                  {msg.movies && (
                    <>
                      <div className="mt-2">
                        {(msg.found_genres.length > 0 || msg.found_people.length > 0) && (
                          <div className="text-xs text-gray-400 mb-2">
                            {msg.found_genres.length > 0 && (
                              <span>Genres: {msg.found_genres.join(', ')} </span>
                            )}
                            {msg.found_people.length > 0 && (
                              <span>People: {msg.found_people.join(', ')}</span>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {msg.movies.map(movie => (
                            <Link
                              key={movie.id}
                              to={`/movie/${movie.id}`}
                              className="bg-gray-900 p-2 rounded overflow-hidden block hover:shadow-lg transition"
                              style={{ textDecoration: 'none' }}
                            >
                              <img
                                src={movie.poster_path || 'https://via.placeholder.com/150x225'}
                                alt={movie.title}
                                className="w-full h-32 object-cover rounded mb-1"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150x225'}
                              />
                              <p className="text-xs text-white truncate">{movie.title}</p>
                              {movie.vote_average && (
                                <p className="text-xs text-yellow-400">
                                  ⭐ {movie.vote_average.toFixed(1)}
                                </p>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                      {/* Like/Dislike for recommendations */}
                      <div className="flex gap-2 mt-2">
                        <button
                          className={`bg-transparent p-1 rounded-full ${recFeedback[i] === 'like' ? 'text-green-500' : 'text-gray-400'}`}
                          onClick={() => handleRecFeedback(i, 'like')}
                          title="Like these recommendations"
                        >
                          <FaThumbsUp />
                        </button>
                        <button
                          className={`bg-transparent p-1 rounded-full ${recFeedback[i] === 'dislike' ? 'text-red-500' : 'text-gray-400'}`}
                          onClick={() => handleRecFeedback(i, 'dislike')}
                          title="Dislike these recommendations"
                        >
                          <FaThumbsDown />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-gray-700 bg-gray-900">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                  placeholder="Ask for movie recommendations..."
                  className="flex-1 bg-gray-800 text-white rounded-l-lg p-2 focus:outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={startListening}
                  className={`bg-gray-800 px-3 py-2 ${
                    isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'
                  }`}
                  disabled={isListening || isTyping}
                >
                  <FaMicrophone />
                </button>
                <button
                  onClick={() => handleSend()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-r-lg px-3 py-2 disabled:opacity-50"
                  disabled={!inputText.trim() || isListening || isTyping}
                >
                  <FaPaperPlane />
                </button>
              </div>
              {isTyping && (
                <div className="text-xs text-gray-400 mt-1">
                  CineScope AI is thinking...
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2 text-center">
                Note: Recommendations may vary and are for reference only.
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center mb-2">
            {/* CINEBOT name above the logo with more highlight */}
            <span
              className="mb-1 text-xs font-bold uppercase tracking-widest"
              style={{
                color: '#a78bfa', // Tailwind purple-400
                textShadow: '0 0 8px #a78bfa, 0 0 2px #fff',
                letterSpacing: '0.15em',
                background: 'linear-gradient(90deg, #a78bfa 0%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              {CHATBOT_NAME}
            </span>
            {/* Enhanced movie logo only */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 6 }}
              whileTap={{ scale: 0.95, rotate: -6 }}
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-2xl border-4 border-white relative"
              title="Open CineScope Chatbot"
              style={{ boxShadow: '0 4px 24px 0 rgba(80,0,200,0.25)' }}
            >
              {/* Enhanced logo: robot + film + chat bubble + sparkle */}
              <span className="relative flex items-center justify-center w-full h-full">
                {/* Sparkle effect */}
                <span className="absolute left-3 top-3 animate-ping">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="4" fill="#f472b6" opacity="0.7"/>
                  </svg>
                </span>
                <FaRobot className="text-5xl text-white drop-shadow-lg z-10" />
                <FaFilm className="absolute text-purple-300 text-3xl left-2 top-2 z-20 animate-spin-slow" />
                <FaRegCommentDots className="absolute text-blue-200 text-2xl right-2 bottom-2 z-20 animate-bounce" />
                {/* Extra sparkle */}
                <span className="absolute right-4 top-4 animate-pulse">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="2" fill="#fbbf24" opacity="0.8"/>
                  </svg>
                </span>
              </span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;





