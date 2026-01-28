"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientForm } from "@/components/client-form";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">내담자 등록</h1>
      </div>

      {/* 폼 */}
      <ClientForm />
    </div>
  );
}
