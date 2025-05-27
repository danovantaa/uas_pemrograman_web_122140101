import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { EyeIcon, PlusCircle, MessageSquare, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { useReviews } from "@/hooks/useReviews";
import { useBookings } from "@/hooks/useBookings"; // Diperlukan untuk filtering review & mendapatkan info booking terkait
import { useSchedules } from "@/hooks/useSchedules"; // Diperlukan untuk mendapatkan info jadwal terkait booking
import ClientDashboardLayout from "@/layouts/client-dashboard-layout";

export default function ClientMyReviewsPage() {
  const { user } = useAuth();
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    fetchAllReviews, // Mengambil semua ulasan [cite: 11]
  } = useReviews();

  const { bookings, fetchUserBookings } = useBookings(); // Mengambil booking klien [cite: 8]
  const { schedules, fetchSchedules } = useSchedules(); // Mengambil semua jadwal [cite: 7]

  const [clientReviews, setClientReviews] = useState([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [clientBookingsMap, setClientBookingsMap] = useState({}); // Map booking_id ke detail booking
  const [clientSchedulesMap, setClientSchedulesMap] = useState({}); // Map schedule_id ke detail schedule

  useEffect(() => {
    if (user && user.role === "client") {
      fetchAllReviews(); // Fetch semua ulasan [cite: 11]
      fetchUserBookings(); // Fetch semua booking user ini [cite: 8]
      fetchSchedules(); // Fetch semua jadwal [cite: 7]
    }
  }, [user, fetchAllReviews, fetchUserBookings, fetchSchedules]);

  useEffect(() => {
    // Membuat map dari booking_id ke detail booking
    if (bookings.length > 0) {
      const map = {};
      bookings.forEach((booking) => {
        map[booking.id] = booking;
      });
      setClientBookingsMap(map);
    }
  }, [bookings]);

  useEffect(() => {
    // Membuat map dari schedule_id ke detail schedule
    if (schedules.length > 0) {
      const map = {};
      schedules.forEach((schedule) => {
        map[schedule.id] = schedule;
      });
      setClientSchedulesMap(map);
    }
  }, [schedules]);

  useEffect(() => {
    // Filter ulasan yang dibuat oleh klien yang login
    if (reviews && user) {
      const filteredReviews = reviews
        .filter((review) => {
          // Asumsi `booking.client_id` tersedia di detail booking yang terkait dengan review
          const relatedBooking = clientBookingsMap[review.booking_id];
          return relatedBooking && relatedBooking.client_id === user.id;
        })
        .sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        ); // Urutkan terbaru
      setClientReviews(filteredReviews);
    }
  }, [reviews, user, clientBookingsMap]);

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setIsDetailDialogOpen(true);
  };

  if (reviewsLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat ulasan saya...</p>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error memuat ulasan: {reviewsError || bookingsError}</p>
        <p>Silakan coba lagi nanti.</p>
      </div>
    );
  }

  if (user.role !== "client") {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p>Hanya klien yang dapat melihat ulasan mereka.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Ulasan Saya</h1>
          <Button asChild>
            <Link to="/client/my-reviews/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tulis Ulasan Baru
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Ulasan</CardTitle>
          </CardHeader>
          <CardContent>
            {clientReviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Ulasan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Komentar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sesi Pada
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientReviews.map((review) => {
                      const relatedBooking =
                        clientBookingsMap[review.booking_id];
                      const relatedSchedule = relatedBooking
                        ? clientSchedulesMap[relatedBooking.schedule_id]
                        : null;

                      return (
                        <tr key={review.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {review.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                review.rating >= 4 &&
                                  "bg-green-100 text-green-800",
                                review.rating === 3 &&
                                  "bg-yellow-100 text-yellow-800",
                                review.rating < 3 && "bg-red-100 text-red-800"
                              )}
                            >
                              <Star className="h-3 w-3 mr-1" /> {review.rating}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 line-clamp-2">
                            {review.comment}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {relatedSchedule
                              ? `${format(
                                  new Date(relatedSchedule.date),
                                  "dd MMM"
                                )} (${relatedSchedule.time_slot})`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(review)}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" /> Lihat Detail
                            </Button>
                            {/* TODO: Tombol edit/delete review (jika didukung backend) */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda belum memberikan ulasan apa pun.{" "}
                <Link
                  to="/client/my-bookings"
                  className="text-primary underline"
                >
                  Lihat booking saya untuk mulai mengulas!
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dialog untuk Detail Ulasan */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detail Ulasan</DialogTitle>
              <DialogDescription>
                Informasi lengkap tentang ulasan ini.
              </DialogDescription>
            </DialogHeader>
            {selectedReview ? (
              <div className="grid gap-4 py-4 text-sm">
                <p>
                  <strong>ID Ulasan:</strong> {selectedReview.id}
                </p>
                <p>
                  <strong>ID Booking:</strong> {selectedReview.booking_id}
                </p>
                <p>
                  <strong>Rating:</strong>
                  <Badge
                    className={cn(
                      "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      selectedReview.rating >= 4 &&
                        "bg-green-100 text-green-800",
                      selectedReview.rating === 3 &&
                        "bg-yellow-100 text-yellow-800",
                      selectedReview.rating < 3 && "bg-red-100 text-red-800"
                    )}
                  >
                    <Star className="h-3 w-3 mr-1" /> {selectedReview.rating}
                  </Badge>
                </p>
                <p>
                  <strong>Komentar:</strong>
                </p>
                <p className="p-2 border rounded-md bg-gray-50">
                  {selectedReview.comment}
                </p>
                {/* Tampilkan detail sesi dan psikolog jika ada */}
                {clientBookingsMap[selectedReview.booking_id] &&
                  clientSchedulesMap[
                    clientBookingsMap[selectedReview.booking_id].schedule_id
                  ] && (
                    <>
                      <h4 className="font-semibold mt-2">
                        Detail Sesi Terkait:
                      </h4>
                      <p>
                        <strong>Tanggal Sesi:</strong>{" "}
                        {format(
                          new Date(
                            clientSchedulesMap[
                              clientBookingsMap[
                                selectedReview.booking_id
                              ].schedule_id
                            ].date
                          ),
                          "dd MMMM yyyy"
                        )}
                      </p>
                      <p>
                        <strong>Waktu Sesi:</strong>{" "}
                        {
                          clientSchedulesMap[
                            clientBookingsMap[selectedReview.booking_id]
                              .schedule_id
                          ].time_slot
                        }
                      </p>
                      {/* TODO: Nama Psikolog (perlu fetch detail user dari psychologist_id) */}
                    </>
                  )}
              </div>
            ) : (
              <p className="text-center">Memuat detail...</p>
            )}
            <DialogFooter>
              <Button onClick={() => setIsDetailDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ClientDashboardLayout>
  );
}
