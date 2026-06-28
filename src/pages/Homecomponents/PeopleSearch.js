import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function PeopleSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [popularPeople, setPopularPeople] = useState([]);

  // Load popular people on mount
  useEffect(() => {
    fetch('http://localhost:5000/people/popular')
      .then(res => res.json())
      .then(data => setPopularPeople(data))
      .catch(err => console.error(err));
  }, []);

  // Search people
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetch(`http://localhost:5000/people/search?q=${query}`)
          .then(res => res.json())
          .then(data => setResults(data))
          .catch(err => console.error(err));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="relative mb-8">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2 shadow-lg">
          <FaSearch className="text-gray-400 mr-2 text-sm" />
          <input
            type="text"
            placeholder="Search people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white placeholder-gray-400 
                      focus:outline-none w-full text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white ml-1"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Results or Popular People */}
      {query ? (
        results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center">No results found</p>
        )
      ) : (
        <>
          <h2 className="text-xl font-bold text-white mb-4">Popular People</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {popularPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PersonCard({ person }) {
  return (
    <Link to={`/person/${person.id}`} className="group">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-blue-500 transition-colors">
          <img
            src={person.profile_path || "https://via.placeholder.com/200"}
            alt={person.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/200";
            }}
          />
        </div>
        <h3 className="mt-3 text-white text-sm md:text-base font-medium text-center">
          {person.name}
        </h3>
        {person.known_for && (
          <p className="text-gray-400 text-xs text-center mt-1">
            {person.known_for}
          </p>
        )}
      </div>
    </Link>
  );
}



