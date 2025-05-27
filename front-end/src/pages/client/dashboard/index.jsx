import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, Users, FileText, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Untuk status booking
import { LoaderCircle } from "lucide-react";
import { format } from "date-fns"; // Untuk format tanggal

import DashboardLayout from "@/layouts/dashboard-layout"; // Menggunakan layout yang sama untuk klien juga
import { useAuth } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings"; // Hook untuk mengelola booking
import ClientDashboardLayout from "@/layouts/client-dashboard-layout";

export default function ClientDashboardPage() {
  const { user } = useAuth(); // Mendapatkan user yang sedang login
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchUserBookings, // Mengambil booking untuk user yang login [cite: 8]
  } = useBookings();

  const [upcomingBookings, setUpcomingBookings] = useState([]);

  useEffect(() => {
    // Hanya fetch bookings jika user sudah ada dan role-nya client
    if (user && user.role === "client") {
      fetchUserBookings(); // Mengambil semua booking untuk client yang login [cite: 8]
    }
  }, [user, fetchUserBookings]);

  useEffect(() => {
    // Filter booking yang akan datang (pending atau confirmed)
    if (bookings) {
      const now = new Date();
      const filtered = bookings
        .filter((booking) => {
          // Asumsi booking memiliki `schedule` object atau schedule_id untuk mendapatkan tanggal/waktu
          // Untuk saat ini, kita hanya bisa memfilter berdasarkan `created_at` atau status
          // Idealnya, booking object harus punya relasi langsung ke schedule date/time untuk filter yang akurat
          // Jika backend tidak mengembalikan detail jadwal di objek booking, kita akan filter sederhana
          return (
            (booking.status === "pending" || booking.status === "confirmed") &&
            new Date(booking.created_at) > new Date(now.setHours(0, 0, 0, 0)) // Contoh filter sederhana, bisa diubah jika ada schedule.date
          );
        })
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // Urutkan dari yang paling awal
        .slice(0, 5); // Ambil 5 booking terdekat
      setUpcomingBookings(filtered);
    }
  }, [bookings]);

  if (bookingsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat dashboard klien...</p>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error memuat data booking: {bookingsError}</p>
        <p>Silakan coba lagi nanti.</p>
      </div>
    );
  }

  // Jika user bukan client, redirect atau tampilkan pesan
  if (user && user.role !== "client") {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-xl font-semibold">Akses Ditolak</h2>
        <p>Hanya klien yang dapat mengakses dashboard ini.</p>
        <Button asChild className="mt-4">
          <Link to="/client/dashboard">
            Kembali ke Dashboard Admin/Psikolog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Klien {user?.username ? `- ${user.username}` : ""}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Booking Mendatang */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Booking Mendatang
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingBookings.map((booking) => (
                    <li key={booking.id} className="text-sm text-gray-700">
                      <p className="font-semibold">
                        Booking ID: {booking.id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {booking.status}
                      </p>
                      {/* TODO: Tampilkan tanggal/waktu jadwal dan nama psikolog.
                          Ini akan memerlukan penyesuaian backend atau fetching data tambahan. */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada booking mendatang.
                </p>
              )}
              <div className="mt-4">
                <Button asChild variant="link" className="px-0">
                  <Link to="/client/my-bookings">Lihat Semua Booking Saya</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: Cari Psikolog */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Cari Psikolog
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Temukan psikolog yang sesuai dengan kebutuhanmu.
              </p>
              <Button asChild>
                <Link to="/client/psikolog">Cari Sekarang</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card: Ulasan Saya */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Ulasan Saya</CardTitle>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Lihat dan kelola ulasan yang telah kamu berikan.
              </p>
              <Button asChild variant="outline">
                <Link to="/client/my-reviews">Lihat Ulasan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bagian Informasi Tambahan / Shortcut (opsional) */}
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold text-gray-800">Informasi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Booking Konfirmasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {bookings.filter((b) => b.status === "confirmed").length}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
}
