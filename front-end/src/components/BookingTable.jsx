import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoaderCircle, EyeIcon, CheckCircle, XCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function BookingTable({
  bookings,
  onViewDetail,
  onUpdateStatus,
  isLoading,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Booking
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jadwal (Tanggal & Waktu)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Klien
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dibuat Pada
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.schedule_details ? (
                  <>
                    {format(new Date(booking.schedule_details.date), "dd MMMM")}
                    {" pukul "}
                    {booking.schedule_details.time_slot}
                  </>
                ) : (
                  `${booking.schedule_id.substring(0, 8)}...`
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {booking.client_details ? (
                  <span className="font-medium">
                    {booking.client_details.username}
                  </span>
                ) : (
                  `${booking.client_id.substring(0, 8)}...`
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Badge
                  className={cn(
                    {
                      "bg-yellow-100 text-yellow-800":
                        booking.status === "pending",
                      "bg-green-100 text-green-800":
                        booking.status === "confirmed",
                      "bg-red-100 text-red-800": booking.status === "rejected",
                    },
                    "capitalize"
                  )}
                >
                  {booking.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(booking.created_at).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetail(booking.id)}
                  disabled={isLoading}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>

                {/* Action Buttons for Pending Bookings */}
                {booking.status === "pending" && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onUpdateStatus(booking.id, "confirmed")}
                      disabled={isLoading}
                      className="ml-2"
                    >
                      {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Konfirmasi
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onUpdateStatus(booking.id, "rejected")}
                      disabled={isLoading}
                      className="ml-2"
                    >
                      {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Tolak
                    </Button>
                  </>
                )}

                {/* Action Button for Confirmed Bookings (Cancel) */}
                {booking.status === "confirmed" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onUpdateStatus(booking.id, "rejected")}
                    disabled={isLoading}
                    className="ml-2"
                  >
                    {isLoading ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    Batalkan
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
