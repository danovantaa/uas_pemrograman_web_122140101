import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-primary/10 text-primary-foreground py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand / Deskripsi Singkat */}
        <div>
          <h3 className="text-xl font-bold mb-3">RuangPulih</h3>
          <p className="text-sm text-muted-foreground">
            Platform konsultasi psikolog online yang aman, nyaman, dan mudah
            diakses.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h4 className="font-semibold mb-2">Navigasi</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link to="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link to="/psikolog" className="hover:underline">
                Psikolog
              </Link>
            </li>
            <li>
              <Link to="/tentang" className="hover:underline">
                Tentang
              </Link>
            </li>
            <li>
              <Link to="/kontak" className="hover:underline">
                Kontak
              </Link>
            </li>
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <h4 className="font-semibold mb-2">Hubungi Kami</h4>
          <p className="text-sm">Email: support@ruangpulih.com</p>
          <p className="text-sm">WhatsApp: +62 812-3456-7890</p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-10 border-t border-primary/20 pt-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} RuangPulih. Semua hak dilindungi.
      </div>
    </footer>
  );
}
