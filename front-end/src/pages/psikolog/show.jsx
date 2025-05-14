import { useParams, Link } from "react-router-dom";
import { useUsers } from "@/hooks/useRuangPulihDataHooks";
import MainLayout from "@/components/main-layout";
import { Mail, MapPin, Star } from "lucide-react";

export default function PsychologistDetailPage() {
  const { id } = useParams();
  const { data: users, loading, error } = useUsers();

  const psychologist = users.find(
    (user) => String(user.id) === id && user.role === "psychologist"
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center">Memuat data psikolog...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-24 text-center text-red-600">
          Gagal memuat data: {error.message}
        </div>
      </MainLayout>
    );
  }

  if (!psychologist) {
    return (
      <MainLayout>
        <div className="py-24 text-center text-muted-foreground">
          Psikolog tidak ditemukan.
          <div className="mt-4">
            <Link to="/psikolog" className="text-primary underline">
              ← Kembali ke daftar psikolog
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">
              {psychologist.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {psychologist.specialization || "Psikolog Umum"}
            </p>
          </div>

          {/* Info */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {psychologist.city || "Lokasi tidak tersedia"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {psychologist.email || "Email tidak tersedia"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-500" />
              Rating: {psychologist.rating || "Belum ada penilaian"}
            </div>
          </div>

          {/* Tentang Psikolog */}
          <div className="bg-primary/5 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-primary mb-2">
              Tentang Psikolog
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {psychologist.bio ||
                "Psikolog ini belum menambahkan deskripsi pribadi."}
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-10 text-center">
            <Link to="/psikolog" className="text-sm text-primary underline">
              ← Kembali ke daftar psikolog
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
