import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { usePsychologists } from "@/hooks/usePsychologists";
import ClientDashboardLayout from "@/layouts/client-dashboard-layout";

export default function PsychologistListPage() {
  const { psychologists, loading, error } = usePsychologists();

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center  text-white p-4">
          <LoaderCircle className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-gray-400 text-lg">Memuat daftar psikolog...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (error) {
    return (
      <ClientDashboardLayout>
        <div className="min-h-screen flex flex-col items-center justify-center  text-white p-4">
          <p className="text-red-500 text-lg mb-2">Error: {error}</p>
          <p className="text-gray-400">
            Gagal memuat daftar psikolog. Silakan coba lagi nanti.
          </p>
        </div>
      </ClientDashboardLayout>
    );
  }

  console.log("Psychologists data:", psychologists);

  return (
    <ClientDashboardLayout>
      <section className="py-10 md:py-16  text-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
            Daftar Psikolog Profesional
          </h1>

          {psychologists.length === 0 ? (
            <p className="text-center text-gray-400 text-lg mt-8">
              Tidak ada psikolog ditemukan saat ini atau belum ada jadwal
              tersedia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {psychologists.map((psikolog) => (
                <Card
                  key={psikolog.id}
                  className="bg-stone-900 p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 rounded-lg"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-primary">
                        {psikolog.username}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-400 mb-4">
                      Jadwal Tersedia:{" "}
                      <span className="font-semibold text-primary">
                        {psikolog.available_schedules?.length || 0}
                      </span>
                    </p>

                    <Button asChild variant="link">
                      <Link to={`/client/psikolog/${psikolog.id}`}>
                        Lihat Profil →
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </ClientDashboardLayout>
  );
}
