"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Client } from "@/lib/db/schema";

const LOCATIONS = ["전체", "정발", "금촌"];
const STATUSES = ["전체", "신규", "진행", "종결"];
const TYPES = ["전체", "-", "놀이", "voucher"];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    location: "전체",
    status: "전체",
    type: "전체",
  });

  useEffect(() => {
    fetchClients();
  }, [filters]);

  const fetchClients = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.location !== "전체") params.set("location", filters.location);
    if (filters.status !== "전체") params.set("status", filters.status);
    if (filters.type !== "전체") params.set("type", filters.type);

    const res = await fetch(`/api/clients?${params.toString()}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "신규":
        return "default";
      case "진행":
        return "success";
      case "종결":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">내담자</h1>
        <Link href="/clients/new">
          <Button size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <Input
          placeholder="이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm min-w-fit"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc === "전체" ? "지역" : loc}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm min-w-fit"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "전체" ? "상태" : s}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm min-w-fit"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "전체" ? "유형" : t}
            </option>
          ))}
        </select>
      </div>

      {/* 내담자 목록 */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          {search ? "검색 결과가 없습니다" : "내담자가 없습니다"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{client.name}</div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <Badge variant="secondary">{client.location}</Badge>
                  <Badge variant={getStatusBadgeVariant(client.status)}>
                    {client.status}
                  </Badge>
                  {client.type !== "-" && (
                    <Badge variant="warning">{client.type}</Badge>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)] ml-2 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
