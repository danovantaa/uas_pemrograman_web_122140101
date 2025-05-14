import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Psikolog", path: "/psikolog" },
  { label: "Tentang", path: "/tentang" },
  { label: "Kontak", path: "/kontak" },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-gradient-to-b from-primary to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-black text-lg font-semibold">
            RuangPulih
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors ${
                  isActive(item.path)
                    ? "text-black font-medium"
                    : "text-black/80 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Login Button */}
          <div className="hidden md:block">
            <Link to="/login">
              <Button>Masuk</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden px-4 pb-3 pt-2 bg-primary/90 backdrop-blur-md">
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block text-sm ${
                isActive(item.path)
                  ? "text-black font-medium"
                  : "text-black/80 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="text-sm px-3 py-1 border border-white text-black rounded text-center hover:bg-white hover:text-primary transition-colors"
          >
            Masuk
          </Link>
        </div>
      </div>
    </header>
  );
}
