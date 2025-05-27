import { useState, useCallback } from "react";

const API_URL = "http://localhost:6543";

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createReview = useCallback(async (bookingId, rating, comment) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ booking_id: bookingId, rating, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to create review.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setReviews((prev) => [...prev, data]);
      setLoading(false);
      return { success: true, review: data };
    } catch (err) {
      setError("An unexpected error occurred while creating review.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  const fetchAllReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "Failed to fetch reviews.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      setReviews(data);
      setLoading(false);
      return { success: true, reviews: data };
    } catch (err) {
      setError("An unexpected error occurred while fetching reviews.");
      setLoading(false);
      return { success: false, error: "An unexpected error occurred." };
    }
  }, []);

  return {
    reviews,
    loading,
    error,
    createReview,
    fetchAllReviews,
  };
}
