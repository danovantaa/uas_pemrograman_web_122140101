import React, { useEffect, useState } from "react";
import { useReviews } from "@/hooks/useReviews";
import { useBookings } from "@/hooks/useBookings"; // Diperlukan untuk memfilter review
import { useSchedules } from "@/hooks/useSchedules"; // Diperlukan untuk memfilter review
import { useAuth } from "@/hooks/useAuth"; // Untuk mendapatkan user info
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Untuk rating atau status review
import { LoaderCircle, MessageSquare, Star, EyeIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import DashboardLayout from "@/layouts/dashboard-layout";

export default function ManageReviewsPage() {
  const { user } = useAuth();
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    fetchAllReviews,
  } = useReviews(); // fetchAllReviews memanggil GET /reviews [cite: 11]
  const { bookings, fetchUserBookings } = useBookings();
  const { schedules, fetchSchedules } = useSchedules();

  const [psychologistReviews, setPsychologistReviews] = useState([]);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    if (user && user.role === "psychologist") {
      // Fetch semua data yang dibutuhkan untuk filtering di frontend
      fetchAllReviews(); // Mengambil semua review [cite: 11]
      fetchUserBookings(); // Mengambil semua booking user yang login (termasuk yang dibuat psikolog jika dia juga client) [cite: 8]
      fetchSchedules(); // Mengambil semua jadwal [cite: 7]
    }
  }, [user, fetchAllReviews, fetchUserBookings, fetchSchedules]);

  useEffect(() => {
    // Filter ulasan yang terkait dengan jadwal dan booking psikolog yang login
    if (
      reviews &&
      bookings &&
      schedules &&
      user &&
      user.role === "psychologist"
    ) {
      // Dapatkan ID jadwal yang dimiliki oleh psikolog ini
      const psychologistsScheduleIds = new Set(
        schedules.filter((s) => s.psychologist_id === user.id).map((s) => s.id)
      );

      // Dapatkan ID booking yang terkait dengan jadwal psikolog
      const relevantBookingIds = new Set(
        bookings
          .filter((b) => psychologistsScheduleIds.has(b.schedule_id))
          .map((b) => b.id)
      );

      // Filter review berdasarkan booking ID yang relevan
      const filteredReviews = reviews
        .filter((review) => relevantBookingIds.has(review.booking_id))
        .sort((a, b) =>
          a.created_at && b.created_at
            ? new Date(b.created_at) - new Date(a.created_at)
            : 0
        ); // Urutkan dari terbaru

      setPsychologistReviews(filteredReviews);
    }
  }, [reviews, bookings, schedules, user]);

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setIsDetailDialogOpen(true);
  };

  if (reviewsLoading || !user || !bookings || !schedules) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat ulasan...</p>
      </div>
    );
  }

  if (reviewsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error loading reviews: {reviewsError}</p>
        <p>Pastikan Anda memiliki hak akses atau coba lagi nanti.</p>
      </div>
    );
  }

  if (user.role !== "psychologist") {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p>Hanya psikolog yang dapat melihat ulasan.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Ulasan Saya</h1>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Ulasan Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            {psychologistReviews.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Ulasan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Komentar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {psychologistReviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {review.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {review.booking_id.substring(0, 8)}...
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
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(review)}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" /> Lihat Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada ulasan relevan untuk Anda.
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
                {/* TODO: Tampilkan informasi klien yang mengulas dan jadwal yang terkait */}
                {/* Ini akan memerlukan join data di backend atau fetch terpisah di frontend */}
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
    </DashboardLayout>
  );
}
