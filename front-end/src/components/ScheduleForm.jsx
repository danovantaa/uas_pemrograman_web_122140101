import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LoaderCircle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";

export function ScheduleForm({ schedule = null, onSubmit, isLoading }) {
  const [date, setDate] = useState(schedule ? new Date(schedule.date) : null);
  const [time, setTime] = useState(schedule ? schedule.time_slot : "");

  useEffect(() => {
    if (schedule) {
      setDate(new Date(schedule.date));
      setTime(schedule.time_slot);
    } else {
      setDate(null);
      setTime("");
    }
  }, [schedule]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Gagal!", { description: "Tanggal dan waktu harus diisi." });
      return;
    }

    const formattedDate = format(date, "yyyy-MM-dd");

    await onSubmit(schedule ? schedule.id : null, {
      date: formattedDate,
      time_slot: time,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">
          Tanggal
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "col-span-3 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="time" className="text-right">
          Waktu (HH:MM)
        </Label>
        <Input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="col-span-3"
        />
      </div>
      <DialogFooter className="mt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {schedule ? "Simpan Perubahan" : "Simpan Jadwal"}
        </Button>
      </DialogFooter>
    </form>
  );
}
