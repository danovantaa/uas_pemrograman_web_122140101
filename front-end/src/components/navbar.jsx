import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Tentang", path: "/tentang" },
  { label: "Kontak", path: "/kontak" },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Tutup menu mobile saat item diklik atau navigasi
  const handleMenuItemClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="w-full fixed top-0 left-0 z-50 bg-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-black text-lg font-semibold"
            onClick={handleMenuItemClick}
          >
            RuangPulih
          </Link>

          {/* Desktop Navigation */}
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
                onClick={handleMenuItemClick}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Login Button (Desktop) */}
          <div className="hidden md:block">
            <Link to="/login" onClick={handleMenuItemClick}>
              <Button>Masuk</Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-black"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-3 pt-2 bg-primary/90 backdrop-blur-md">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block text-sm py-2 px-3 rounded ${
                  isActive(item.path)
                    ? "bg-primary text-white font-medium"
                    : "text-black/80 hover:bg-primary/10 hover:text-black"
                }`}
                onClick={handleMenuItemClick}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              className="text-sm px-3 py-1 border border-white text-black rounded text-center hover:bg-white hover:text-primary transition-colors mt-2"
              onClick={handleMenuItemClick}
            >
              Masuk
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
