import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const API_URL = "http://localhost:6543";

export function usePsychologists() {
  const [psychologists, setPsychologists] = useState([]);
  const [selectedPsychologist, setSelectedPsychologist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPsychologistsWithSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/psychologists/available`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage =
          data.error || "Failed to fetch psychologists with schedules.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setPsychologists(data);
      setLoading(false);
      return { success: true, psychologists: data };
    } catch (err) {
      setError("An unexpected error occurred while fetching psychologists.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const fetchPsychologistDetail = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setSelectedPsychologist(null);
    try {
      const res = await fetch(`${API_URL}/psychologists/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Psychologist not found.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setSelectedPsychologist(data);
      setLoading(false);
      return { success: true, psychologist: data };
    } catch (err) {
      setError(
        "An unexpected error occurred while fetching psychologist detail."
      );
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  // Loads list of psychologists when hook is first used
  useEffect(() => {
    fetchPsychologistsWithSchedules();
  }, [fetchPsychologistsWithSchedules]);

  return {
    psychologists,
    selectedPsychologist,
    loading,
    error,
    fetchPsychologistsWithSchedules,
    fetchPsychologistDetail,
  };
}
