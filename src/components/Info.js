import { useEffect } from "react";

export default function InfoModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && event.target.id === "info-overlay") {
        onClose();
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isOpen, onClose]);

  return (
    <div
      id="info-overlay"
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-800 p-6 shadow-lg transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-3">Welcome to CineScope!</h2>
        <p className="text-base text-white mb-4">
          <span className="font-semibold text-pink-400">CineScope</span> helps you discover movies by genre, mood, person, and even language. Explore top films in 6 languages—English, Hindi, Telugu, Tamil, Malayalam, and Kannada—so everyone can find something to enjoy!
        </p>
        <ul className="list-disc list-inside text-white mb-4 text-sm space-y-1">
          <li><span className="text-purple-300 font-semibold">Smart Search</span> for movies, genres, people, or languages</li>
          <li><span className="text-purple-300 font-semibold">Personalized</span> profiles & watchlists</li>
          <li><span className="text-purple-300 font-semibold">Chatbot</span> for quick recommendations</li>
        </ul>
        <p className="text-xs text-gray-400 mt-4 border-t border-gray-700 pt-3">
          <span className="font-semibold">Data Source:</span> All movie and people data belongs to <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">TMDb and Youtube</a>.
        </p>
      </div>
    </div>
  );
}



