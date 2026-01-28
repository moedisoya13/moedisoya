"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  datetime: string;
  duration: number;
  status: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    const res = await fetch(
      `/api/appointments?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
    );
    const data = await res.json();
    setAppointments(data);
    setLoading(false);
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.datetime), date)
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold min-w-[120px] text-center">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <Link href={`/calendar/new?date=${format(selectedDate, "yyyy-MM-dd")}`}>
          <Button size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
          <div
            key={day}
            className={`text-center text-sm py-2 font-medium ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-[var(--muted-foreground)]"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {renderCalendar().map((day, i) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <button
              key={i}
              onClick={() => setSelectedDate(day)}
              className={`aspect-square p-1 rounded-lg flex flex-col items-center justify-start transition-colors ${
                isSelected
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : isToday(day)
                  ? "bg-[var(--accent)]"
                  : ""
              } ${!isCurrentMonth ? "opacity-40" : ""}`}
            >
              <span
                className={`text-sm ${
                  i % 7 === 0 && !isSelected ? "text-red-500" : ""
                } ${i % 7 === 6 && !isSelected ? "text-blue-500" : ""}`}
              >
                {format(day, "d")}
              </span>
              {dayAppointments.length > 0 && (
                <div
                  className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    isSelected ? "bg-white" : "bg-[var(--primary)]"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜 일정 */}
      <div className="border-t border-[var(--border)] pt-4">
        <h2 className="font-semibold mb-3">
          {format(selectedDate, "M월 d일 (EEEE)", { locale: ko })}
        </h2>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
          </div>
        ) : selectedDateAppointments.length === 0 ? (
          <p className="text-[var(--muted-foreground)] text-center py-4">
            예정된 상담이 없습니다
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDateAppointments.map((apt) => (
              <Link
                key={apt.id}
                href={`/calendar/${apt.id}`}
                className="block p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{apt.clientName}</span>
                  <Badge
                    variant={
                      apt.status === "completed"
                        ? "success"
                        : apt.status === "cancelled"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {apt.status === "scheduled"
                      ? "예정"
                      : apt.status === "completed"
                      ? "완료"
                      : "취소"}
                  </Badge>
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  {format(new Date(apt.datetime), "HH:mm")} ({apt.duration}분)
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
