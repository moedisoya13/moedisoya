"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/appointment-form";
import { Suspense } from "react";

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultDate = searchParams.get("date") || undefined;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">일정 등록</h1>
      </div>

      {/* 폼 */}
      <AppointmentForm defaultDate={defaultDate} />
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <Suspense fallback={<div className="p-4">로딩 중...</div>}>
      <NewAppointmentContent />
    </Suspense>
  );
}
