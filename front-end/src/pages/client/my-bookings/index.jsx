import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { EyeIcon, Trash2, LoaderCircle, Star } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import ClientDashboardLayout from "@/layouts/client-dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { useSchedules } from "@/hooks/useSchedules";
import { ReviewFormDialog } from "@/components/ReviewFormDialog"; // Import new ReviewFormDialog

export default function ClientMyBookingsPage() {
  const { user } = useAuth();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchUserBookings,
    fetchBookingDetail,
    bookingDetail,
    deleteBooking,
  } = useBookings();

  const { schedules, fetchSchedules } = useSchedules();
  const [clientSchedulesMap, setClientSchedulesMap] = useState({});

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // State for AlertDialog confirmation
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [bookingToDeleteId, setBookingToDeleteId] = useState(null);

  // State for Review Dialog
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [bookingToReviewId, setBookingToReviewId] = useState(null);

  useEffect(() => {
    if (user && user.role === "client") {
      fetchUserBookings();
      fetchSchedules();
    }
  }, [user, fetchUserBookings, fetchSchedules]);

  useEffect(() => {
    if (schedules.length > 0) {
      const map = {};
      schedules.forEach((schedule) => {
        map[schedule.id] = schedule;
      });
      setClientSchedulesMap(map);
    }
  }, [schedules]);

  const handleViewDetail = useCallback(
    async (bookingId) => {
      await fetchBookingDetail(bookingId);
      setIsDetailDialogOpen(true);
    },
    [fetchBookingDetail]
  );

  const handleInitiateDelete = useCallback((bookingId) => {
    setBookingToDeleteId(bookingId);
    setIsConfirmingDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!bookingToDeleteId) return;

    setIsActionLoading(true);
    const result = await deleteBooking(bookingToDeleteId);

    if (result.success) {
      toast.success("Booking berhasil dibatalkan!");
      // Re-fetch bookings to update the list after deletion
      fetchUserBookings();
    } else {
      toast.error("Gagal membatalkan booking!", {
        description: result.error || "Terjadi kesalahan tidak diketahui.",
      });
    }
    setIsActionLoading(false);
    setIsConfirmingDelete(false);
    setBookingToDeleteId(null);
  }, [bookingToDeleteId, deleteBooking, fetchUserBookings]); // Added fetchUserBookings to dependency array

  // Handler to open the review dialog
  const handleOpenReviewDialog = useCallback((bookingId) => {
    setBookingToReviewId(bookingId);
    setIsReviewDialogOpen(true);
  }, []);

  // Callback after a review is successfully submitted
  const handleReviewSuccess = useCallback(() => {
    // Optionally refresh bookings or just close the dialog
    fetchUserBookings(); // Refresh to potentially hide the "Ulas" button if review is one-time
  }, [fetchUserBookings]);

  const sortedBookings = React.useMemo(() => {
    return [...bookings].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [bookings]);

  if (bookingsLoading || !user) {
    return (
      <ClientDashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Memuat riwayat booking...</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (bookingsError) {
    return (
      <ClientDashboardLayout>
        <div className="text-red-500 text-center p-4">
          <p>Error memuat booking: {bookingsError}</p>
          <p>Silakan coba lagi nanti.</p>
        </div>
      </ClientDashboardLayout>
    );
  }

  if (user.role !== "client") {
    return (
      <ClientDashboardLayout>
        <div className="text-center text-red-500 p-8">
          <h2 className="text-xl font-semibold">Akses Ditolak</h2>
          <p>Hanya klien yang dapat melihat riwayat booking.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Riwayat Booking Saya
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Booking</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jadwal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dibuat Pada
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedBookings.map((booking) => {
                      const relatedSchedule =
                        clientSchedulesMap[booking.schedule_id];
                      return (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.id.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {relatedSchedule
                              ? `${format(
                                  new Date(relatedSchedule.date),
                                  "dd MMM"
                                )} ${relatedSchedule.time_slot}`
                              : `${booking.schedule_id.substring(
                                  0,
                                  8
                                )}... (Jadwal tidak ditemukan)`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge
                              className={cn(
                                {
                                  "bg-yellow-100 text-yellow-800":
                                    booking.status === "pending",
                                  "bg-green-100 text-green-800":
                                    booking.status === "confirmed",
                                  "bg-red-100 text-red-800":
                                    booking.status === "rejected",
                                },
                                "capitalize"
                              )}
                            >
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(booking.id)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {booking.status === "pending" && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleInitiateDelete(booking.id)}
                                disabled={isActionLoading}
                                className="ml-2"
                              >
                                {isActionLoading ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Batal
                              </Button>
                            )}
                            {/* Opsi untuk review jika statusnya confirmed/completed dan belum direview */}
                            {booking.status === "confirmed" && (
                              <Button
                                variant="secondary" // Use variant secondary, not asChild Link directly here for consistency
                                size="sm"
                                onClick={() =>
                                  handleOpenReviewDialog(booking.id)
                                } // Open dialog
                                className="ml-2"
                              >
                                <Star className="h-4 w-4 mr-1" /> Ulas
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda belum memiliki booking.{" "}
                <Link to="/psikolog" className="text-primary underline">
                  Cari psikolog untuk booking pertama Anda!
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dialog untuk Detail Booking */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detail Booking</DialogTitle>
              <DialogDescription>
                Informasi lengkap tentang booking ini.
              </DialogDescription>
            </DialogHeader>
            {bookingDetail ? (
              <div className="grid gap-4 py-4 text-sm">
                <p>
                  <strong>ID:</strong> {bookingDetail.id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge
                    className={cn(
                      {
                        "bg-yellow-100 text-yellow-800":
                          bookingDetail.status === "pending",
                        "bg-green-100 text-green-800":
                          bookingDetail.status === "confirmed",
                        "bg-red-100 text-red-800":
                          bookingDetail.status === "rejected",
                      },
                      "capitalize"
                    )}
                  >
                    {bookingDetail.status}
                  </Badge>
                </p>
                <p>
                  <strong>Dibuat Pada:</strong>{" "}
                  {new Date(bookingDetail.created_at).toLocaleString()}
                </p>

                {/* Detail Jadwal */}
                {clientSchedulesMap[bookingDetail.schedule_id] && (
                  <>
                    <h4 className="font-semibold mt-2">Detail Jadwal:</h4>
                    <p>
                      <strong>Tanggal:</strong>{" "}
                      {format(
                        new Date(
                          clientSchedulesMap[bookingDetail.schedule_id].date
                        ),
                        "dd MMMM"
                      )}
                    </p>
                    <p>
                      <strong>Waktu:</strong>{" "}
                      {clientSchedulesMap[bookingDetail.schedule_id].time_slot}
                    </p>
                    {/* TODO: Tampilkan nama psikolog (perlu fetch user detail dari psychologist_id) */}
                    <p>
                      <strong>Status Jadwal:</strong>{" "}
                      {clientSchedulesMap[bookingDetail.schedule_id].is_booked
                        ? "Terbooking"
                        : "Tersedia"}
                    </p>
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

        {/* AlertDialog for Cancel Confirmation */}
        <AlertDialog
          open={isConfirmingDelete}
          onOpenChange={setIsConfirmingDelete}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Pembatalan Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini
                tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsConfirmingDelete(false);
                  setBookingToDeleteId(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Ya, Batalkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Review Form Dialog */}
        <ReviewFormDialog
          open={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          bookingId={bookingToReviewId}
          onReviewSuccess={handleReviewSuccess}
        />
      </div>
    </ClientDashboardLayout>
  );
}
