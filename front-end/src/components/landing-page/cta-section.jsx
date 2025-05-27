import { Link } from "react-router-dom";
import { buttonVariants } from "../ui/button";

export default function CTASection() {
  return (
    <section className="w-full bg-primary to-primary/10 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center text-black">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Siap Menemukan Psikolog yang Tepat untukmu?
        </h2>
        <p className="text-lg md:text-xl mb-8 text-black/90">
          Yuk mulai perjalananmu untuk pulih dan lebih sehat secara mental. Kami
          siap mendampingimu.
        </p>
        <Link to="/register" className={buttonVariants()}>
          Mulai Sekarang!
        </Link>
      </div>
    </section>
  );
}
