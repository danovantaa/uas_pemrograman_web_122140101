import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-br from-primary to-white py-16 px-6 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Kiri: Teks Hero */}
        <div className="text-primary-foreground">
          <h1 className="text-4xl leading-10 md:text-5xl font-extrabold mb-6">
            Temukan Ruang Aman untuk Bicara dan Pulih
          </h1>
          <p className="text-lg md:text-xl mb-8 text-primary-foreground/80">
            Konsultasi dengan psikolog profesional secara online. Aman, nyaman,
            dan mudah diakses dari mana saja.
          </p>
          <Link
            to="/psikolog"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-md shadow hover:bg-primary/90 transition"
          >
            Cari Psikolog
          </Link>
        </div>

        {/* Kanan: Ilustrasi */}
        <div className="flex justify-center">
          <img
            src="/hero-image.png"
            alt="Ilustrasi konsultasi psikolog"
            className="max-w-full w-[90%] md:w-[80%] h-auto"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
