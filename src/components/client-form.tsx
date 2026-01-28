"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Client } from "@/lib/db/schema";

interface ClientFormProps {
  client?: Client;
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: client?.name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    notes: client?.notes || "",
    location: client?.location || "정발",
    status: client?.status || "신규",
    type: client?.type || "-",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);

    const url = client ? `/api/clients/${client.id}` : "/api/clients";
    const method = client ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/clients");
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm("정말 삭제하시겠습니까?")) return;

    setLoading(true);
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/clients");
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      {/* 이름 */}
      <Input
        label="이름 *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="내담자 이름"
        required
      />

      {/* 연락처 */}
      <Input
        label="연락처"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="010-0000-0000"
      />

      {/* 이메일 */}
      <Input
        label="이메일"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="email@example.com"
      />

      {/* 지역 */}
      <div>
        <label className="block text-sm font-medium mb-2">지역</label>
        <RadioGroup
          value={formData.location}
          onValueChange={(value) => setFormData({ ...formData, location: value })}
        >
          <RadioGroupItem value="정발">정발</RadioGroupItem>
          <RadioGroupItem value="금촌">금촌</RadioGroupItem>
        </RadioGroup>
      </div>

      {/* 상태 */}
      <div>
        <label className="block text-sm font-medium mb-2">상태</label>
        <RadioGroup
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <RadioGroupItem value="신규">신규</RadioGroupItem>
          <RadioGroupItem value="진행">진행</RadioGroupItem>
          <RadioGroupItem value="종결">종결</RadioGroupItem>
        </RadioGroup>
      </div>

      {/* 유형 */}
      <div>
        <label className="block text-sm font-medium mb-2">유형</label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <RadioGroupItem value="-">-</RadioGroupItem>
          <RadioGroupItem value="놀이">놀이</RadioGroupItem>
          <RadioGroupItem value="voucher">voucher</RadioGroupItem>
        </RadioGroup>
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium mb-1.5">메모</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="메모 입력..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-[var(--input)] bg-transparent text-base placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-4">
        {client && (
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
        <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
          {loading ? "저장 중..." : client ? "수정" : "등록"}
        </Button>
      </div>
    </form>
  );
}
