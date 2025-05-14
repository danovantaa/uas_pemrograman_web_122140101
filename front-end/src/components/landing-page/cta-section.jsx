import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="w-full bg-gradient-to-r from-primary to-primary/70 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Siap Menemukan Psikolog yang Tepat untukmu?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-white/90">
          Yuk mulai perjalananmu untuk pulih dan lebih sehat secara mental. Kami
          siap mendampingimu.
        </p>
        <Link
          to="/psikolog"
          className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-md shadow hover:bg-gray-100 transition"
        >
          Cari Psikolog Sekarang
        </Link>
      </div>
    </section>
  );
}
