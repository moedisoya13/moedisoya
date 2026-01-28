"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NotificationSettings {
  reminderEnabled: boolean;
  reminderMinutes: number;
  dailySummary: boolean;
  summaryTime: string;
}

export default function SettingsPage() {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    reminderEnabled: true,
    reminderMinutes: 60,
    dailySummary: true,
    summaryTime: "08:00",
  });
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA 설치 여부 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Push 지원 확인
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true);
      checkPushStatus();
    }

    // PWA 설치 프롬프트 캡처
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const checkPushStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setPushEnabled(!!subscription);
    } catch (error) {
      console.error("Push status check failed:", error);
    }
  };

  const enablePush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("알림 권한이 필요합니다.");
        setLoading(false);
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        alert("VAPID 키가 설정되지 않았습니다.");
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // 서버에 구독 정보 저장
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setPushEnabled(true);
    } catch (error) {
      console.error("Push subscription failed:", error);
      alert("알림 설정에 실패했습니다.");
    }
    setLoading(false);
  };

  const disablePush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // 서버에서 구독 정보 삭제
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setPushEnabled(false);
    } catch (error) {
      console.error("Push unsubscription failed:", error);
    }
    setLoading(false);
  };

  const installPWA = async () => {
    if (deferredPrompt) {
      (deferredPrompt as BeforeInstallPromptEvent).prompt();
      const { outcome } = await (deferredPrompt as BeforeInstallPromptEvent).userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const saveSettings = async () => {
    // 설정 저장 로직 (나중에 API 연결)
    alert("설정이 저장되었습니다.");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">설정</h1>

      {/* PWA 설치 */}
      {!isInstalled && deferredPrompt && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-5 h-5" />
              앱 설치
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">
              홈 화면에 추가하여 더 빠르게 접근하세요.
            </p>
            <Button onClick={installPWA} className="w-full">
              홈 화면에 추가
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Push 알림 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {pushEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            Push 알림
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pushSupported ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              이 브라우저에서는 Push 알림을 지원하지 않습니다.
            </p>
          ) : (
            <>
              <p className="text-sm text-[var(--muted-foreground)] mb-3">
                {pushEnabled
                  ? "알림이 활성화되어 있습니다."
                  : "상담 일정 알림을 받으세요."}
              </p>
              <Button
                onClick={pushEnabled ? disablePush : enablePush}
                variant={pushEnabled ? "outline" : "default"}
                disabled={loading}
                className="w-full"
              >
                {loading ? "처리 중..." : pushEnabled ? "알림 끄기" : "알림 켜기"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      {pushEnabled && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 상담 리마인더 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">상담 리마인더</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  상담 전 알림
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, reminderEnabled: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {settings.reminderEnabled && (
              <select
                value={settings.reminderMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, reminderMinutes: Number(e.target.value) })
                }
                className="w-full h-11 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-base"
              >
                <option value={30}>30분 전</option>
                <option value={60}>1시간 전</option>
                <option value={120}>2시간 전</option>
                <option value={1440}>하루 전</option>
              </select>
            )}

            {/* 일일 요약 */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">오늘 일정 요약</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  매일 아침 오늘 일정 알림
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dailySummary}
                  onChange={(e) =>
                    setSettings({ ...settings, dailySummary: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--ring)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {settings.dailySummary && (
              <input
                type="time"
                value={settings.summaryTime}
                onChange={(e) =>
                  setSettings({ ...settings, summaryTime: e.target.value })
                }
                className="w-full h-11 px-3 rounded-lg border border-[var(--input)] bg-[var(--background)] text-base"
              />
            )}

            <Button onClick={saveSettings} className="w-full">
              설정 저장
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 앱 정보 */}
      <Card>
        <CardContent className="p-4 text-center text-sm text-[var(--muted-foreground)]">
          <p>상담 스케줄 v1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );
}

// VAPID 키 변환 유틸
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
