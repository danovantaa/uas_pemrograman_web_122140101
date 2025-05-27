import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Star, Clock, LoaderCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import ClientDashboardLayout from "@/layouts/client-dashboard-layout";
import { usePsychologists } from "@/hooks/usePsychologists";
import { useBookings } from "@/hooks/useBookings";

export default function PsychologistDetailPage() {
  const { id: psychologistId } = useParams();
  const navigate = useNavigate();

  const {
    selectedPsychologist,
    loading: psychologistsLoading,
    fetchPsychologistDetail,
  } = usePsychologists();

  const { createBooking, loading: bookingCreationLoading } = useBookings();

  const [isBookingConfirmDialogOpen, setIsBookingConfirmDialogOpen] =
    useState(false);
  const [selectedScheduleToBook, setSelectedScheduleToBook] = useState(null);

  // Fetch psychologist details on component mount or ID change
  useEffect(() => {
    if (psychologistId) {
      fetchPsychologistDetail(psychologistId);
    }
  }, [psychologistId, fetchPsychologistDetail]);

  // Handle available schedules from selectedPsychologist
  const psychologistSchedules = React.useMemo(() => {
    if (!selectedPsychologist?.available_schedules) return [];

    const now = new Date();
    return selectedPsychologist.available_schedules
      .filter((s) => new Date(`${s.date}T${s.time_slot}`) > now && !s.is_booked)
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time_slot}`).getTime() -
          new Date(`${b.date}T${b.time_slot}`).getTime()
      );
  }, [selectedPsychologist]);

  // Use reviews directly from selectedPsychologist.reviews
  const psychologistReviews = React.useMemo(() => {
    if (!selectedPsychologist?.reviews) return [];
    // Sort reviews by creation date, most recent first (if 'created_at' existed)
    // Since 'created_at' is not in model, sorting by it will not work reliably.
    // For now, it will use the order from the backend.
    return selectedPsychologist.reviews.slice(0, 5); // Take top 5 reviews
  }, [selectedPsychologist]);

  const handleBookSchedule = (schedule) => {
    setSelectedScheduleToBook(schedule);
    setIsBookingConfirmDialogOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedScheduleToBook) return;

    const result = await createBooking(selectedScheduleToBook.id);
    if (result.success) {
      toast.success("Booking berhasil!", {
        description: `Anda berhasil booking sesi pada ${format(
          new Date(selectedScheduleToBook.date),
          "dd MMMM"
        )} pukul ${selectedScheduleToBook.time_slot}.`,
      });
      setIsBookingConfirmDialogOpen(false);
      fetchPsychologistDetail(psychologistId);
      setTimeout(() => navigate("/client/my-bookings"), 1000);
    } else {
      toast.error("Gagal booking!", {
        description: result.error || "Terjadi kesalahan saat membuat booking.",
      });
    }
  };

  if (psychologistsLoading || !psychologistId) {
    return (
      <ClientDashboardLayout>
        <div className="py-24 text-center flex justify-center items-center h-full">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary mr-2" />
          <p className="text-gray-500">Memuat profil psikolog...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (!selectedPsychologist) {
    return (
      <ClientDashboardLayout>
        <div className="py-24 text-center text-muted-foreground">
          <h2 className="text-xl font-semibold mb-4">
            Psikolog tidak ditemukan.
          </h2>
          <Button asChild>
            <Link to="/client/psikolog">← Kembali ke daftar psikolog</Link>
          </Button>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Profil Psikolog */}
          <div className="mb-8 p-6 bg-primary/5 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {selectedPsychologist.username}
            </h1>
            <p className="text-muted-foreground text-sm">
              {selectedPsychologist.specialization || "Psikolog Umum"}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {selectedPsychologist.email}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {selectedPsychologist.average_rating
                  ? `${selectedPsychologist.average_rating}/5`
                  : "Belum ada penilaian"}{" "}
                ({selectedPsychologist.total_reviews || 0} ulasan)
              </span>
            </div>
          </div>

          {/* Bagian Jadwal Tersedia */}
          <div className="mb-10 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Jadwal Tersedia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {psychologistSchedules.length > 0 ? (
                psychologistSchedules.map((schedule) => (
                  <Card
                    key={schedule.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-lg">
                        {format(new Date(schedule.date), "dd MMMM")}
                      </p>
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {schedule.time_slot} WIB
                      </p>
                    </div>
                    <Button
                      onClick={() => handleBookSchedule(schedule)}
                      disabled={schedule.is_booked || bookingCreationLoading}
                    >
                      {bookingCreationLoading &&
                      selectedScheduleToBook?.id === schedule.id ? (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Booking Sekarang"
                      )}
                    </Button>
                  </Card>
                ))
              ) : (
                <p className="col-span-full text-muted-foreground">
                  Tidak ada jadwal tersedia saat ini.
                </p>
              )}
            </div>
          </div>

          {/* Bagian Ulasan dari Klien */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Ulasan dari Klien
            </h2>
            {psychologistReviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {psychologistReviews.map((review) => (
                  <Card key={review.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center mb-2">
                        <Badge
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            review.rating >= 4 && "bg-green-100 text-green-800",
                            review.rating === 3 &&
                              "bg-yellow-100 text-yellow-800",
                            review.rating < 3 && "bg-red-100 text-red-800"
                          )}
                        >
                          <Star className="h-3 w-3 mr-1" /> {review.rating}
                        </Badge>
                        {/* DIHAPUS: Tanggal ulasan tidak tersedia di model Review saat ini */}
                        {/* <span className="ml-2 text-sm text-muted-foreground">
                          {format(new Date(review.created_at), "dd MMM yyyy")}
                        </span> */}
                      </div>
                      <p className="text-sm text-gray-800">
                        "{review.comment}"
                      </p>
                      {/* TODO: Tampilkan nama klien yang memberi ulasan (perlu dijoin di backend reviews query) */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Belum ada ulasan untuk psikolog ini.
              </p>
            )}
          </div>

          {/* Dialog Konfirmasi Booking */}
          <Dialog
            open={isBookingConfirmDialogOpen}
            onOpenChange={setIsBookingConfirmDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Konfirmasi Booking</DialogTitle>
                <DialogDescription>
                  Anda akan booking sesi dengan {selectedPsychologist?.username}{" "}
                  pada tanggal{" "}
                  {selectedScheduleToBook &&
                    format(
                      new Date(selectedScheduleToBook.date),
                      "dd MMMM"
                    )}{" "}
                  pukul {selectedScheduleToBook?.time_slot}.
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Pastikan informasi di atas sudah benar.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingConfirmDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={confirmBooking}
                  disabled={bookingCreationLoading}
                >
                  {bookingCreationLoading &&
                  selectedScheduleToBook?.id === selectedScheduleToBook.id ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Konfirmasi & Booking"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Back Link */}
          <div className="mt-10 text-center">
            <Link
              to="/client/psikolog"
              className="text-sm text-primary underline"
            >
              ← Kembali ke daftar psikolog
            </Link>
          </div>
        </div>
      </section>
    </ClientDashboardLayout>
  );
}
