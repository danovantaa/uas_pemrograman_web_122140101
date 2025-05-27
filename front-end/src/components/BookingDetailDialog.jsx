import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function BookingDetailDialog({ open, onOpenChange, bookingDetail }) {
  if (!bookingDetail) return null;

  // Function to copy email to clipboard
  const handleCopyEmail = () => {
    if (bookingDetail.client_details?.email) {
      const el = document.createElement("textarea");
      el.value = bookingDetail.client_details.email;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Email klien berhasil disalin!");
    } else {
      toast.error("Tidak ada email untuk disalin.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <strong>ID Booking:</strong> {bookingDetail.id}
            </p>
            <p>
              <strong>Jadwal:</strong>{" "}
              {bookingDetail.schedule_details ? (
                <>
                  {format(
                    new Date(bookingDetail.schedule_details.date),
                    "dd MMMM"
                  )}
                  {" pukul "}
                  {bookingDetail.schedule_details.time_slot}
                </>
              ) : (
                bookingDetail.schedule_id
              )}
            </p>
            <p className="flex items-center gap-2">
              <strong>Klien:</strong>{" "}
              {bookingDetail.client_details ? (
                <>
                  {bookingDetail.client_details.username} (
                  {bookingDetail.client_details.email})
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyEmail}
                    className="h-7 w-7"
                    title="Salin Email"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                bookingDetail.client_id
              )}
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
              {bookingDetail.created_at
                ? new Date(bookingDetail.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        ) : (
          <p className="text-center">Memuat detail...</p>
        )}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
