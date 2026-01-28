"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/appointment-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Appointment {
  id: string;
  clientId: string;
  datetime: string;
  duration: number;
  status: string;
  notes: string | null;
}

export default function AppointmentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    const res = await fetch(`/api/appointments/${id}`);
    if (res.ok) {
      const data = await res.json();
      setAppointment(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-4 text-center">
        <p className="text-[var(--muted-foreground)]">일정을 찾을 수 없습니다</p>
        <Button onClick={() => router.push("/calendar")} className="mt-4">
          캘린더로
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">일정 수정</h1>
      </div>

      {/* 폼 */}
      <AppointmentForm
        appointment={{
          ...appointment,
          datetime: new Date(appointment.datetime),
        }}
      />
    </div>
  );
}
