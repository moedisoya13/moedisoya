"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Client } from "@/lib/db/schema";

interface AppointmentFormProps {
  appointment?: {
    id: string;
    clientId: string;
    datetime: Date;
    duration: number;
    status: string;
    notes: string | null;
  };
  defaultDate?: string;
}

export function AppointmentForm({ appointment, defaultDate }: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: appointment?.clientId || "",
    date: appointment
      ? format(new Date(appointment.datetime), "yyyy-MM-dd")
      : defaultDate || format(new Date(), "yyyy-MM-dd"),
    time: appointment
      ? format(new Date(appointment.datetime), "HH:mm")
      : "10:00",
    duration: appointment?.duration || 60,
    status: appointment?.status || "scheduled",
    notes: appointment?.notes || "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await fetch("/api/clients?status=진행");
    const data = await res.json();
    setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) return;

    setLoading(true);

    const datetime = new Date(`${formData.date}T${formData.time}`);
    const url = appointment ? `/api/appointments/${appointment.id}` : "/api/appointments";
    const method = appointment ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: formData.clientId,
        datetime: datetime.toISOString(),
        duration: formData.duration,
        status: formData.status,
        notes: formData.notes || null,
      }),
    });

    if (res.ok) {
      router.push("/calendar");
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment || !confirm("정말 삭제하시겠습니까?")) return;

    setLoading(true);
    const res = await fetch(`/api/appointments/${appointment.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/calendar");
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      {/* 내담자 선택 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">내담자 *</label>
        <select
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          className="w-full h-11 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          required
        >
          <option value="">내담자 선택...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.location})
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 */}
      <Input
        label="날짜 *"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      {/* 시간 */}
      <Input
        label="시간 *"
        type="time"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        required
      />

      {/* 상담 시간 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">상담 시간 (분)</label>
        <select
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          className="w-full h-11 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          <option value={30}>30분</option>
          <option value={50}>50분</option>
          <option value={60}>60분</option>
          <option value={90}>90분</option>
          <option value={120}>120분</option>
        </select>
      </div>

      {/* 상태 (수정 시에만) */}
      {appointment && (
        <div>
          <label className="block text-sm font-medium mb-1.5">상태</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full h-11 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="scheduled">예정</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      )}

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">메모</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="상담 메모..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-[var(--input)] bg-transparent text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        {appointment && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1"
          >
            삭제
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || !formData.clientId}
          className="flex-1"
        >
          {loading ? "저장 중..." : appointment ? "수정" : "등록"}
        </Button>
      </div>
    </form>
  );
}
