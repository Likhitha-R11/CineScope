import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Settings, User, LogOut } from "lucide-react";

export default function Sidebar({ isOpen, setIsOpen, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 text-white z-30"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={28} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white p-5 w-64 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40 shadow-lg flex flex-col`}
      >
        <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
            {user?.profile_emoji || "👤"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-pink-400">{user?.name || "Guest"}</h2>
            <p className="text-sm text-gray-400">
              {user?.is_child ? "Kids Profile" : "Movie Enthusiast"}
            </p>
          </div>
        </div>

        <div className="flex-grow flex flex-col justify-center">
          <ul className="space-y-6 text-lg font-semibold">
            <li>
              <Link
                to="/"
                className="hover:text-pink-400 text-red-400"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/languages"
                className="hover:text-pink-400 text-red-400"
                onClick={() => setIsOpen(false)}
              >
                Languages
              </Link>
            </li>
            <li>
              <Link
                to="/genres"
                className="hover:text-pink-400 text-red-400"
                onClick={() => setIsOpen(false)}
              >
                Genres
              </Link>
            </li>
            <li>
              <Link
                to="/people"
                className="hover:text-pink-400 text-red-400"
                onClick={() => setIsOpen(false)}
              >
                People
              </Link>
            </li>
          </ul>
        </div>

        <div className="pb-6 border-t border-gray-700 pt-4 space-y-4">
          <Link
            to="/settings"
            className="flex items-center gap-2 hover:text-pink-400 text-red-400 font-semibold"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={20} /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-pink-400 text-red-400 font-semibold w-full"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}
