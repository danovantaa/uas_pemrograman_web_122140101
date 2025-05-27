import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function BookingDetailsDialog({ open, onOpenChange, bookingDetails }) {
  if (!bookingDetails) return null;

  const { client_details, status, created_at, schedule_details } =
    bookingDetails;

  const handleCopyEmail = () => {
    if (client_details?.email) {
      const el = document.createElement("textarea");
      el.value = client_details.email;
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
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Nama Klien:</span>
            <span className="col-span-2 text-sm text-gray-700">
              {client_details?.username || "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Email Klien:</span>
            <div className="col-span-2 flex items-center gap-2">
              <span className="text-sm text-gray-700">
                {client_details?.email || "N/A"}
              </span>
              {client_details?.email && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyEmail}
                  className="h-7 w-7"
                  title="Salin Email"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Jadwal:</span>
            <span className="col-span-2 text-sm text-gray-700">
              {schedule_details ? (
                <>
                  {new Date(schedule_details.date).toLocaleDateString()}
                  {" pukul "}
                  {schedule_details.time_slot}
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Status Booking:</span>
            <span className="col-span-2 text-sm text-gray-700">
              {status || "N/A"}
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm font-medium">Dibuat Pada:</span>
            <span className="col-span-2 text-sm text-gray-700">
              {created_at ? new Date(created_at).toLocaleString() : "N/A"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
