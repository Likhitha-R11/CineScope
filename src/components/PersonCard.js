import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PersonCard({ person, selectedId, onSelect }) {
  if (!person?.id) return null;
  const isSelected = selectedId === person.id;

  const handleSelect = (e) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(person.id);
    }
  };

  return (
    <Link to={`/person/${person.id}`} className="group" onClick={handleSelect}>
      <motion.div
        className="w-40 h-40 rounded-full overflow-hidden shadow-lg border-2 border-gray-700 transition-transform duration-300 mx-auto relative cursor-pointer"
        whileHover={{
          scale: 1.08,
          boxShadow: isSelected
            ? "0 0 32px 8px #38bdf8, 0 0 60px 16px #06b6d4"
            : "0 0 18px 2px #38bdf8, 0 0 32px 6px #06b6d4"
        }}
        animate={isSelected ? { scale: 1.06 } : { scale: 1 }}
        style={{
          background: isSelected
            ? "linear-gradient(135deg, rgba(56,189,248,0.28) 0%, rgba(6,182,212,0.18) 100%)"
            : "rgba(0,0,0,0.7)",
          boxShadow: isSelected
            ? "0 0 32px 8px #38bdf8, 0 0 60px 16px #06b6d4"
            : undefined,
          border: isSelected ? "2.5px solid #38bdf8" : "2px solid transparent"
        }}
      >
        <img 
          src={person.profile_path || "https://via.placeholder.com/200x200"} 
          alt={person.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/200x200";
          }}
        />
      </motion.div>
      <h3 className="mt-2 text-white text-center text-sm font-semibold">
        {person.name}
      </h3>
      {person.known_for && (
        <p className="text-gray-400 text-xs text-center">
          {person.known_for}
        </p>
      )}
    </Link>
  );
}





