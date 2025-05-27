import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ScheduleTable({
  schedules,
  onEdit,
  onDelete,
  onViewBooking,
  isLoading,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Waktu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status & Klien
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(schedule.date), "dd MMMM")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {schedule.time_slot}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={cn(
                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                    schedule.is_booked
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  )}
                >
                  {schedule.is_booked ? "Terbooking" : "Tersedia"}
                </span>
                {schedule.is_booked &&
                  schedule.current_booking?.client_details && ( // Safe navigation for client_details
                    <div className="mt-1 text-xs text-muted-foreground">
                      Oleh: {schedule.current_booking.client_details.username}
                    </div>
                  )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {schedule.is_booked && schedule.current_booking && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => onViewBooking(schedule.current_booking)}
                    disabled={isLoading}
                  >
                    <Eye className="mr-1 h-4 w-4" /> Lihat Booking
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(schedule)}
                  disabled={isLoading || schedule.is_booked}
                >
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                  onClick={() => onDelete(schedule.id)}
                  disabled={isLoading || schedule.is_booked}
                >
                  <Trash2 className="mr-1 h-4 w-4" /> Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
