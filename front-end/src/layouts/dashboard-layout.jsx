import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ShieldCheck,
  CalendarCheck,
  BarChart2,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

// Menu items
const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Validasi Psikolog",
    path: "/dashboard/psikolog-validation",
    icon: ShieldCheck,
  },
  { label: "Pengguna", path: "/dashboard/manage-users", icon: Users },
  { label: "Jadwal", path: "/dashboard/schedules", icon: CalendarCheck },
  { label: "Transaksi", path: "/dashboard/reports", icon: FileCheck },
  { label: "Statistik", path: "/dashboard/statistics", icon: BarChart2 },
];

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      {/* Top Navbar */}
      <header className="bg-white shadow px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary">RuangPulih Admin</h1>

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
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link to="/" className="ml-4">
              <Button variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-1" />
                Keluar
              </Button>
            </Link>
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
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <Link
              to="/"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-red-100"
            >
              <LogOut className="inline w-4 h-4 mr-2" />
              Keluar
            </Link>
          </div>
        )}
      </header>

      {/* Content Area */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
