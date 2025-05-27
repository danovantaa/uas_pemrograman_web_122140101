import React, { useEffect, useState, useCallback } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard-layout";
import { BookingTable } from "@/components/BookingTable";
import { BookingDetailDialog } from "@/components/BookingDetailDialog";
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

export default function ManageBookingsPage() {
  const { user } = useAuth();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchUserBookings,
    fetchBookingDetail,
    bookingDetail,
    updateBookingStatus,
  } = useBookings();

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // State for AlertDialog confirmation
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);
  const [actionBookingId, setActionBookingId] = useState(null);
  const [actionNewStatus, setActionNewStatus] = useState(null);
  const [actionConfirmationMessage, setActionConfirmationMessage] =
    useState("");

  // Fetch bookings when user data is available
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, fetchUserBookings]);

  // Handler for viewing booking details in a dialog
  const handleViewDetail = useCallback(
    async (bookingId) => {
      await fetchBookingDetail(bookingId);
      setIsDetailDialogOpen(true);
    },
    [fetchBookingDetail]
  );

  // Initiates the AlertDialog for status update
  const handleInitiateStatusUpdate = useCallback((bookingId, newStatus) => {
    let message = "";
    if (newStatus === "confirmed") {
      message = `Apakah Anda yakin ingin MENGKONFIRMASI booking ini?`;
    } else if (newStatus === "rejected") {
      message = `Apakah Anda yakin ingin MENOLAK booking ini? Ini akan membatalkan booking.`;
    } else {
      message = `Apakah Anda yakin ingin mengubah status booking ini menjadi '${newStatus}'?`;
    }

    setActionBookingId(bookingId);
    setActionNewStatus(newStatus);
    setActionConfirmationMessage(message);
    setIsConfirmingAction(true);
  }, []);

  // Executes the status update after AlertDialog confirmation
  const handleConfirmStatusUpdate = useCallback(async () => {
    if (!actionBookingId || !actionNewStatus) {
      toast.error("Terjadi kesalahan, tidak ada aksi yang dipilih.");
      return;
    }

    const result = await updateBookingStatus(actionBookingId, actionNewStatus);

    if (result.success) {
      toast.success(
        `Booking ${actionBookingId.substring(
          0,
          8
        )}... berhasil diperbarui menjadi ${actionNewStatus}.`
      );
      setIsDetailDialogOpen(false); // Close detail dialog if it was open
    } else {
      toast.error("Gagal memperbarui status booking!", {
        description: result.error || "Terjadi kesalahan.",
      });
    }

    // Reset AlertDialog states
    setIsConfirmingAction(false);
    setActionBookingId(null);
    setActionNewStatus(null);
    setActionConfirmationMessage("");
  }, [actionBookingId, actionNewStatus, updateBookingStatus]);

  // Render loading state
  if (bookingsLoading || !user) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat data booking...</p>
      </div>
    );
  }

  // Render error state
  if (bookingsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error loading bookings: {bookingsError}</p>
        <p>Pastikan Anda memiliki hak akses atau coba lagi nanti.</p>
      </div>
    );
  }

  // Render access denied state for non-psychologists
  if (user.role !== "psychologist") {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p>Hanya psikolog yang dapat mengelola booking.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Booking</h1>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Booking Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <BookingTable
                bookings={bookings}
                onViewDetail={handleViewDetail}
                onUpdateStatus={handleInitiateStatusUpdate} // Use the new initiate handler
                isLoading={bookingsLoading}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Tidak ada booking masuk yang relevan.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Booking Details */}
        <BookingDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          bookingDetail={bookingDetail}
        />

        {/* AlertDialog for Status Update Confirmation */}
        <AlertDialog
          open={isConfirmingAction}
          onOpenChange={setIsConfirmingAction}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Aksi</AlertDialogTitle>
              <AlertDialogDescription>
                {actionConfirmationMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsConfirmingAction(false);
                  setActionBookingId(null);
                  setActionNewStatus(null);
                  setActionConfirmationMessage("");
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmStatusUpdate}
                disabled={bookingsLoading}
              >
                {bookingsLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Lanjutkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
