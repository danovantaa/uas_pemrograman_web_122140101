import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Star,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

// Menu items for client dashboard
const navItems = [
  { label: "Dashboard", path: "/client", icon: LayoutDashboard },
  { label: "Cari Psikolog", path: "/client/psikolog", icon: Users },
  { label: "Booking Saya", path: "/client/my-bookings", icon: FileText },
  { label: "Ulasan Saya", path: "/client/my-reviews", icon: Star },
];

export default function ClientDashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkSession, logout, user, loading: authLoading } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Wait until authLoading is complete
    if (!authLoading) {
      const { isValid } = checkSession();
      if (!isValid) {
        toast.info("Sesi Anda telah berakhir atau tidak valid.", {
          description: "Silakan login kembali.",
        });
        navigate("/login");
      }
      // Optional: Restrict access based on user role
      if (user && user.role !== "client") {
        toast.warning(
          "Akses ditolak. Anda tidak memiliki izin untuk halaman ini."
        );
        navigate("/"); // Redirect to landing page or another appropriate page
      }
    }
  }, [checkSession, navigate, user, authLoading]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("Berhasil keluar!", {
        description: "Anda telah log out dari akun Anda.",
      });
    } else {
      toast.error("Gagal keluar!", {
        description: result.error || "Terjadi kesalahan saat logout.",
      });
    }
    // Redirection to login page is handled by the useEffect above if session becomes invalid
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <p>Memeriksa sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Top Navbar */}
      <header className="bg-white shadow px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">RuangPulih Klien</h1>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-4 items-center">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition",
                  isActive(path)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-primary/10"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="ml-4"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Keluar
            </Button>
          </nav>
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-1">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 text-sm",
                  isActive(path)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-primary/10"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </Button>
          </div>
        )}
      </header>

      {/* Content Area */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
