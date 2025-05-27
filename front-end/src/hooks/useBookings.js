import { useState, useCallback } from "react";

const API_URL = "http://localhost:6543";

export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to fetch bookings.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setBookings(data);
      setLoading(false);
      return { success: true, bookings: data };
    } catch (err) {
      setError("An unexpected error occurred while fetching bookings.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const createBooking = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ schedule_id: scheduleId }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to create booking.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setBookings((prev) => [...prev, data]);
      setLoading(false);
      return { success: true, booking: data };
    } catch (err) {
      setError("An unexpected error occurred while creating booking.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const fetchBookingDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setBookingDetail(null);
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Booking detail not found.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setBookingDetail(data);
      setLoading(false);
      return { success: true, booking: data };
    } catch (err) {
      setError("An unexpected error occurred while fetching booking detail.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const deleteBooking = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to delete booking.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setBookings((prev) => prev.filter((b) => b.id !== id));
      setLoading(false);
      return { success: true, message: data.message };
    } catch (err) {
      setError("An unexpected error occurred while deleting booking.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const updateBookingStatus = useCallback(
    async (bookingId, newStatus) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();

        if (!res.ok) {
          const errorMessage = data.error || "Failed to update booking status.";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: data.status, schedule: data.schedule }
              : booking
          )
        );
        if (bookingDetail && bookingDetail.id === bookingId) {
          setBookingDetail(data);
        }
        setLoading(false);
        return { success: true, booking: data };
      } catch (err) {
        setError("An unexpected error occurred while updating booking status.");
        setLoading(false);
        return { success: false, error: "An unexpected error occurred." };
      }
    },
    [bookingDetail]
  );

  return {
    bookings,
    bookingDetail,
    loading,
    error,
    fetchUserBookings,
    createBooking,
    fetchBookingDetail,
    deleteBooking,
    updateBookingStatus,
  };
}
