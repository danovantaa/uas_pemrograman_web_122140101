import React, { useEffect, useState, useMemo } from "react";
import { useSchedules } from "@/hooks/useSchedules";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircle, LoaderCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/dashboard-layout";
import { ScheduleForm } from "@/components/ScheduleForm"; // Your ScheduleForm component
import { ScheduleTable } from "@/components/ScheduleTable"; // Your ScheduleTable component
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog"; // Your BookingDetailsDialog component

export default function ManageSchedulesPage() {
  const { user } = useAuth();
  const {
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [isBookingDetailsDialogOpen, setIsBookingDetailsDialogOpen] =
    useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);

  useEffect(() => {
    if (user?.role === "psychologist") {
      fetchSchedules();
    }
  }, [user, fetchSchedules]);

  const psychologistSchedules = useMemo(() => {
    return schedules
      .filter((schedule) => schedule.psychologist_id === user?.id)
      .sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time_slot}`);
        const dateTimeB = new Date(`${b.date}T${b.time_slot}`);
        return dateTimeB.getTime() - dateTimeA.getTime();
      });
  }, [schedules, user]);

  // FIX IS HERE: Correctly receive `data` object from ScheduleForm
  const handleAddSchedule = async (scheduleId, data) => {
    // `data` already contains { date: "YYYY-MM-DD", time_slot: "HH:MM" }
    const { date: formattedDate, time_slot } = data; // Destructure directly

    if (!formattedDate || !time_slot) {
      toast.error("Gagal menambah jadwal!", {
        description: "Tanggal dan waktu harus diisi.",
      });
      return;
    }

    const result = await addSchedule(formattedDate, time_slot);

    if (result.success) {
      toast.success("Jadwal berhasil ditambahkan!");
      setIsAddDialogOpen(false);
    } else {
      toast.error("Gagal menambah jadwal!", {
        description: result.error || "Terjadi kesalahan tidak diketahui.",
      });
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = async (scheduleId, updatedData) => {
    // `updatedData` already contains { date: "YYYY-MM-DD", time_slot: "HH:MM" }
    const result = await updateSchedule(scheduleId, updatedData);

    if (result.success) {
      toast.success("Jadwal berhasil diperbarui!");
      setIsEditDialogOpen(false);
      setEditingSchedule(null);
    } else {
      toast.error("Gagal memperbarui jadwal!", {
        description: result.error || "Terjadi kesalahan tidak diketahui.",
      });
    }
  };

  const handleDeleteClick = (scheduleId) => {
    setDeletingScheduleId(scheduleId);
  };

  const handleConfirmDelete = async () => {
    if (!deletingScheduleId) return;

    const result = await deleteSchedule(deletingScheduleId);

    if (result.success) {
      toast.success("Jadwal berhasil dihapus!", {
        description: result.message,
      });
    } else {
      toast.error("Gagal menghapus jadwal!", {
        description: result.error || "Terjadi kesalahan tidak diketahui.",
      });
    }
    setDeletingScheduleId(null);
  };

  const handleViewBooking = (bookingDetails) => {
    setSelectedBookingDetails(bookingDetails);
    setIsBookingDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat jadwal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error loading schedules: {error}</p>
        <p>Pastikan Anda memiliki hak akses atau coba lagi nanti.</p>
      </div>
    );
  }

  if (user?.role !== "psychologist") {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p>Hanya psikolog yang dapat mengelola jadwal.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Jadwal</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Jadwal Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              </DialogHeader>
              {/* ScheduleForm handles its own date/time state and formatting */}
              <ScheduleForm onSubmit={handleAddSchedule} isLoading={loading} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Jadwal Anda</CardTitle>
          </CardHeader>
          <CardContent>
            {psychologistSchedules.length > 0 ? (
              <ScheduleTable
                schedules={psychologistSchedules}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteClick}
                onViewBooking={handleViewBooking}
                isLoading={loading}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Anda belum memiliki jadwal. Klik "Tambah Jadwal Baru" untuk
                memulai.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Jadwal</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <ScheduleForm
              schedule={editingSchedule}
              onSubmit={handleUpdateSchedule}
              isLoading={loading}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingScheduleId}
        onOpenChange={(open) => !open && setDeletingScheduleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak
              dapat dibatalkan. Anda tidak dapat menghapus jadwal yang sudah
              terbooking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={loading}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BookingDetailsDialog
        open={isBookingDetailsDialogOpen}
        onOpenChange={setIsBookingDetailsDialogOpen}
        bookingDetails={selectedBookingDetails}
      />
    </DashboardLayout>
  );
}
