import { useUsers } from "@/hooks/useRuangPulihDataHooks";
import MainLayout from "@/components/main-layout";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";

export default function PsychologistListPage() {
  const { data: users, loading, error } = useUsers();

  const psychologists = users.filter((user) => user.role === "psychologist");

  return (
    <MainLayout>
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
            Daftar Psikolog Profesional
          </h1>

          {loading && <p className="text-center text-gray-500">Loading...</p>}
          {error && (
            <p className="text-center text-red-500">Error: {error.message}</p>
          )}

          {!loading && psychologists.length === 0 && (
            <p className="text-center text-muted-foreground">
              Tidak ada psikolog ditemukan.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {psychologists.map((psikolog) => (
              <div
                key={psikolog.id}
                className="bg-primary/5 rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-primary">
                    {psikolog.name}
                  </h3>
                  <span className="text-sm text-primary/80">
                    {psikolog.specialization}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {psikolog.city}
                </p>

                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {psikolog.rating || "Belum ada rating"}
                </p>

                <Link
                  to={`/psikolog/${psikolog.id}`}
                  className="text-sm text-primary underline hover:text-primary/80"
                >
                  Lihat Profil →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
