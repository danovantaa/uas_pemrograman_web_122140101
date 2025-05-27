import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Users,
  Star,
  MessageSquare,
  LoaderCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { useSchedules } from "@/hooks/useSchedules";
import { useBookings } from "@/hooks/useBookings";
import { useReviews } from "@/hooks/useReviews";

export default function PsychologistDashboardPage() {
  const { user } = useAuth();
  const {
    schedules,
    loading: schedulesLoading,
    error: schedulesError,
    fetchSchedules,
  } = useSchedules();
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    fetchUserBookings,
  } = useBookings();
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    fetchAllReviews,
  } = useReviews();

  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [psychologistBookings, setPsychologistBookings] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    fetchSchedules(); // Mengambil semua jadwal. [cite: 7]
    fetchAllReviews(); // Mengambil semua review. [cite: 11]
    fetchUserBookings(); // Mengambil semua booking user yang login. [cite: 8]
  }, [fetchSchedules, fetchAllReviews, fetchUserBookings]);

  useEffect(() => {
    if (schedules && user) {
      const now = new Date();
      const filtered = schedules
        .filter(
          (s) =>
            s.psychologist_id === user.id &&
            new Date(`${s.date}T${s.time_slot}`) > now
        )
        .sort(
          (a, b) =>
            new Date(`${a.date}T${a.time_slot}`).getTime() -
            new Date(`${b.date}T${b.time_slot}`).getTime()
        )
        .slice(0, 5);
      setUpcomingSchedules(filtered);
    }
  }, [schedules, user]);

  useEffect(() => {
    if (bookings && schedules && user) {
      const psychScheduleIds = new Set(
        schedules.filter((s) => s.psychologist_id === user.id).map((s) => s.id)
      );
      const filtered = bookings
        .filter((booking) => psychScheduleIds.has(booking.schedule_id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setPsychologistBookings(filtered);
    }
  }, [bookings, schedules, user]);

  useEffect(() => {
    if (reviews && bookings && schedules && user) {
      const psychScheduleIds = new Set(
        schedules.filter((s) => s.psychologist_id === user.id).map((s) => s.id)
      );
      const relevantBookingIds = new Set(
        bookings
          .filter((b) => psychScheduleIds.has(b.schedule_id))
          .map((b) => b.id)
      );
      const filtered = reviews
        .filter((review) => relevantBookingIds.has(review.booking_id))
        .sort((a, b) =>
          b.created_at ? new Date(b.created_at) - new Date(a.created_at) : 0
        )
        .slice(0, 5);
      setLatestReviews(filtered);
    }
  }, [reviews, bookings, schedules, user]);

  if (schedulesLoading || bookingsLoading || reviewsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memuat dashboard...</p>
      </div>
    );
  }

  if (schedulesError || bookingsError || reviewsError) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error memuat data:</p>
        {schedulesError && <p>Jadwal: {schedulesError}</p>}
        {bookingsError && <p>Booking: {bookingsError}</p>}
        {reviewsError && <p>Ulasan: {reviewsError}</p>}
        <p>Silakan coba lagi nanti.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Psikolog {user?.username ? `- ${user.username}` : ""}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Jadwal Mendatang */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Jadwal Mendatang
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcomingSchedules.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingSchedules.map((schedule) => (
                    <li
                      key={schedule.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <Clock className="h-4 w-4 text-primary" />
                      <span>
                        {schedule.date} - {schedule.time_slot}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada jadwal mendatang.
                </p>
              )}
              <div className="mt-4">
                <Button asChild variant="link" className="px-0">
                  <Link to="/dashboard/manage-schedules">
                    Lihat Semua Jadwal
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: Booking Terbaru */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Booking Terbaru
              </CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {psychologistBookings.length > 0 ? (
                <ul className="space-y-2">
                  {psychologistBookings.map((booking) => (
                    <li key={booking.id} className="text-sm text-gray-700">
                      <p className="font-semibold">
                        Booking ID: {booking.id.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {booking.status}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada booking terbaru.
                </p>
              )}
              <div className="mt-4">
                <Button asChild variant="link" className="px-0">
                  <Link to="/dashboard/manage-bookings">
                    Lihat Semua Booking
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card: Ulasan Terbaru */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Ulasan Terbaru
              </CardTitle>
              <Star className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {latestReviews.length > 0 ? (
                <ul className="space-y-2">
                  {latestReviews.map((review) => (
                    <li key={review.id} className="text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">
                          Rating: {review.rating}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {review.comment}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Tidak ada ulasan terbaru.
                </p>
              )}
              <div className="mt-4">
                <Button asChild variant="link" className="px-0">
                  <Link to="/dashboard/manage-reviews">Lihat Semua Ulasan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistik Cepat */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Statistik Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Jadwal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {
                    schedules.filter((s) => s.psychologist_id === user?.id)
                      .length
                  }
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Booking Diterima</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {
                    psychologistBookings.filter((b) => b.status === "confirmed")
                      .length
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
