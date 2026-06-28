import { FiInfo } from "react-icons/fi";

export default function Navbar({ setInfoOpen }) {
  return (
    <div className="py-4 px-2 bg-gray-800 flex justify-between items-center w-full" style={{ maxWidth: "100vw" }}>
      <div />
      <button 
        onClick={() => setInfoOpen(true)} 
        className="text-white hover:text-purple-400"
      >
        <FiInfo size={24} />
      </button>
    </div>
  );
}