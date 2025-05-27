import { useState, useCallback } from "react";

const API_URL = "http://localhost:6543";

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/schedules`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to fetch schedules.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSchedules(data);
      setLoading(false);
      return { success: true, schedules: data };
    } catch (err) {
      setError("An unexpected error occurred while fetching schedules.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const addSchedule = useCallback(async (date, timeSlot) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ date, time_slot: timeSlot }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to add schedule.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSchedules((prevSchedules) => [...prevSchedules, data]);
      setLoading(false);
      return { success: true, schedule: data };
    } catch (err) {
      setError("An unexpected error occurred while adding schedule.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const updateSchedule = useCallback(async (id, updatedFields) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to update schedule.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSchedules((prevSchedules) =>
        prevSchedules.map((s) => (s.id === id ? data : s))
      );
      setLoading(false);
      return { success: true, schedule: data };
    } catch (err) {
      setError("An unexpected error occurred while updating schedule.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const deleteSchedule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/schedules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to delete schedule.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSchedules((prevSchedules) => prevSchedules.filter((s) => s.id !== id));
      setLoading(false);
      return { success: true, message: data.message };
    } catch (err) {
      setError("An unexpected error occurred while deleting schedule.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
