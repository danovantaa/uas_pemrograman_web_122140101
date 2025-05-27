import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="text-white pt-12 px-6 border-t border-primary/20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 pb-10">
        {/* Kolom 1: Tentang RuangPulih */}
        <div>
          <h3 className="text-xl font-bold mb-4">RuangPulih</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            RuangPulih adalah platform konsultasi psikolog online yang
            menyediakan ruang aman dan nyaman untuk semua orang dalam mengelola
            kesehatan mental mereka secara profesional.
          </p>
        </div>

        {/* Kolom 2: Link Navigasi */}
        <div>
          <h4 className="text-md font-semibold mb-4">Menu</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="/" className="hover:underline">
                Beranda
              </Link>
            </li>
            <li>
              <Link to="/tentang" className="hover:underline">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link to="/kontak" className="hover:underline">
                Kontak
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolom 3: Kontak */}
        <div>
          <h4 className="text-md font-semibold mb-4">Hubungi Kami</h4>
          <ul className="text-sm space-y-3 text-white/80">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5" />
              Jl. Sehat Mental No. 42, Jakarta
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5" />
              support@ruangpulih.com
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5" />
              +62 812 0000 1234
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bawah */}
      <div className="border-t border-primary/20 pt-6 text-center text-xs text-white/60">
        © {year} RuangPulih. Semua hak cipta dilindungi.
      </div>
    </footer>
  );
}
