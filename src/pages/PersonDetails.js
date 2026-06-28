import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PersonDetails() {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(`http://localhost:5000/people/${id}`);
        const data = await response.json();
        setPerson(data);
      } catch (error) {
        console.error("Error fetching person:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;
  if (!person) return <div className="text-white text-center py-20">Person not found</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/people" className="inline-block mb-6 text-purple-400 hover:text-purple-300">
          ← Back to People
        </Link>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <img
              src={person.profile_path || "https://via.placeholder.com/300x450"}
              alt={person.name}
              className="w-full rounded-lg shadow-xl"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x450";
              }}
            />
          </div>
          
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-4xl font-bold mb-4">{person.name}</h1>
            
            {person.biography && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Biography</h3>
                <p className="text-gray-300 whitespace-pre-line">{person.biography}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Personal Info</h3>
                {person.birthday && <p className="mb-2"><span className="text-gray-400">Born:</span> {new Date(person.birthday).toLocaleDateString()}</p>}
                {person.place_of_birth && <p className="mb-2"><span className="text-gray-400">From:</span> {person.place_of_birth}</p>}
                {person.known_for && <p><span className="text-gray-400">Known For:</span> {person.known_for}</p>}
              </div>
            </div>
          </div>
        </div>

        {person.movies?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Filmography</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {person.movies.map((movie) => (
                <div key={movie.id} className="group">
                  <Link to={`/movie/${movie.id}`} className="block">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={movie.poster_path || "https://via.placeholder.com/300x450"}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                    </div>
                    <div className="mt-2">
                      <h3 className="text-white text-sm font-medium group-hover:text-purple-400">
                        {movie.title}
                      </h3>
                      {movie.role && (
                        <p className="text-gray-400 text-xs mt-1">
                          as {movie.role}
                        </p>
                      )}
                      {movie.release_date && (
                        <p className="text-gray-500 text-xs mt-1">
                          {movie.release_date.slice(0, 4)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

