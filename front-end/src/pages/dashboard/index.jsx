import { useUsers, useSessions } from "@/hooks/useRuangPulihDataHooks";
import DashboardLayout from "@/layouts/dashboard-layout";

export default function Dashboard() {
  const { data: users } = useUsers();
  const { data: sessions, loading, error } = useSessions();

  // Membuat dictionary userId → nama
  const userMap = users.reduce((map, user) => {
    map[user.id] = user.name;
    return map;
  }, {});

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Laporan Sesi Konsultasi
      </h1>

      {loading && <p className="text-gray-600">Memuat data sesi...</p>}
      {error && (
        <p className="text-red-600">Gagal memuat data: {error.message}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold text-primary mb-1">
              {userMap[session.psychologistId] || "Psikolog Tidak Dikenal"}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              Klien: {userMap[session.clientId] || "Klien Tidak Dikenal"}
            </p>
            <p className="text-sm text-muted-foreground">
              Tanggal:{" "}
              {new Date(session.date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p
              className={`text-sm mt-2 font-medium ${
                session.status === "completed"
                  ? "text-green-600"
                  : session.status === "pending"
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            >
              Status: {session.status}
            </p>
          </div>
        ))}
      </div>

      {sessions.length === 0 && !loading && (
        <p className="text-muted-foreground text-center mt-8">
          Belum ada data sesi konsultasi.
        </p>
      )}
    </DashboardLayout>
  );
}
