import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReviews } from "@/hooks/useReviews";

export function ReviewFormDialog({
  open,
  onOpenChange,
  bookingId,
  onReviewSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const {
    createReview,
    loading: reviewLoading,
    error: reviewError,
  } = useReviews();

  // Reset form when dialog opens/closes or bookingId changes
  useEffect(() => {
    if (open) {
      setRating(0);
      setComment("");
    }
  }, [open, bookingId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Gagal mengirim ulasan!", {
        description: "Rating harus diisi.",
      });
      return;
    }

    if (!bookingId) {
      toast.error("Gagal mengirim ulasan!", {
        description: "Booking ID tidak ditemukan.",
      });
      return;
    }

    const result = await createReview(bookingId, rating, comment);

    if (result.success) {
      toast.success("Ulasan berhasil dikirim!", {
        description: "Terima kasih atas ulasan Anda.",
      });
      onOpenChange(false); // Close dialog
      if (onReviewSuccess) {
        onReviewSuccess(); // Callback to refresh parent data if needed
      }
    } else {
      toast.error("Gagal mengirim ulasan!", {
        description: reviewError || "Terjadi kesalahan saat mengirim ulasan.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Berikan Ulasan Anda</DialogTitle>
          <DialogDescription>
            Bagikan pengalaman Anda tentang sesi ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating
            </Label>
            <div className="col-span-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <Star
                  key={starValue}
                  className={cn(
                    "h-6 w-6 cursor-pointer transition-colors",
                    rating >= starValue
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  )}
                  onClick={() => setRating(starValue)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="comment" className="text-right">
              Komentar
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bagikan pemikiran Anda tentang sesi ini..."
              className="col-span-3"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reviewLoading}
          >
            Batal
          </Button>
          <Button onClick={handleSubmitReview} disabled={reviewLoading}>
            {reviewLoading ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Kirim Ulasan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
