import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Leaf, LogOut, Menu, X, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/meals", label: "Meal Log" },
  { to: "/recipes", label: "Recipes" },
  { to: "/recommendations", label: "Targets" },
  { to: "/resources", label: "Resources" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `hover:text-primary-600 transition ${isActive ? "text-primary-600" : "text-gray-600"}`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-gray-800 shrink-0">
          <span className="bg-primary-500 text-white p-1.5 rounded-lg">
            <Leaf size={20} />
          </span>
          NutriAssist
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user ? (
            <>
              {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/profile" className="text-gray-400 hover:text-primary-600 transition" title="Profile settings">
                <Settings size={18} />
              </Link>
              <span className="text-gray-400">Hi, {user.name.split(" ")[0]}</span>
              <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-600 transition">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 transition">
                Login
              </Link>
              <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-gray-600"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1 text-sm font-medium">
          {user ? (
            <>
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 ${isActive ? "text-primary-600" : "text-gray-600"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-600">
                Profile settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1 py-2 text-red-500">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-600">
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block bg-primary-600 text-white px-4 py-2 rounded-lg text-center mt-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
