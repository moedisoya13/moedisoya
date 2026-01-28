"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, Users, Clock, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientLocation: string;
  clientType: string;
  datetime: string;
  duration: number;
  status: string;
}

interface Stats {
  todayCount: number;
  weekCount: number;
  activeClients: number;
}

export default function HomePage() {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({ todayCount: 0, weekCount: 0, activeClients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = addDays(today, 1);
    const weekEnd = addDays(today, 7);

    // 오늘 일정
    const todayRes = await fetch(
      `/api/appointments?startDate=${today.toISOString()}&endDate=${tomorrow.toISOString()}`
    );
    const todayData = await todayRes.json();
    setTodayAppointments(todayData.filter((a: Appointment) => a.status === "scheduled"));

    // 이번 주 일정
    const weekRes = await fetch(
      `/api/appointments?startDate=${tomorrow.toISOString()}&endDate=${weekEnd.toISOString()}`
    );
    const weekData = await weekRes.json();
    setUpcomingAppointments(weekData.filter((a: Appointment) => a.status === "scheduled").slice(0, 5));

    // 통계
    const clientsRes = await fetch("/api/clients?status=진행");
    const clientsData = await clientsRes.json();

    setStats({
      todayCount: todayData.filter((a: Appointment) => a.status === "scheduled").length,
      weekCount: weekData.filter((a: Appointment) => a.status === "scheduled").length,
      activeClients: clientsData.length,
    });

    setLoading(false);
  };

  const formatAppointmentDate = (datetime: string) => {
    const date = new Date(datetime);
    if (isToday(date)) return `오늘 ${format(date, "HH:mm")}`;
    if (isTomorrow(date)) return `내일 ${format(date, "HH:mm")}`;
    return format(date, "M/d (EEE) HH:mm", { locale: ko });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">상담 스케줄</h1>
        <p className="text-[var(--muted-foreground)]">
          {format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })}
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">오늘</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
            <div className="text-2xl font-bold">{stats.weekCount}</div>
            <div className="text-xs text-[var(--muted-foreground)]">이번 주</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <div className="text-xs text-[var(--muted-foreground)]">진행 중</div>
          </CardContent>
        </Card>
      </div>

      {/* 오늘의 일정 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>오늘의 일정</CardTitle>
            <Link href="/calendar" className="text-sm text-[var(--primary)]">
              전체보기
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {todayAppointments.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              오늘 예정된 상담이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/calendar/${apt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--accent)] hover:opacity-80 transition-opacity"
                >
                  <div>
                    <div className="font-medium">{apt.clientName}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {format(new Date(apt.datetime), "HH:mm")} · {apt.duration}분
                      {apt.clientType !== "-" && ` · ${apt.clientType}`}
                    </div>
                  </div>
                  <Badge variant="secondary">{apt.clientLocation}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 다가오는 일정 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>다가오는 일정</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {upcomingAppointments.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-4">
              예정된 상담이 없습니다
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/calendar/${apt.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
                >
                  <div>
                    <div className="font-medium">{apt.clientName}</div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {formatAppointmentDate(apt.datetime)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
