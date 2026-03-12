"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  dealerNotificationSettingsQueryKey,
  fetchDealerNotificationSettings,
  updateDealerNotificationSettings,
} from "@/features/mypage/lib/dealer-mypage-query";
import type { DealerNotificationSettings } from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerNotificationSettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: dealerNotificationSettingsQueryKey,
    queryFn: fetchDealerNotificationSettings,
  });
  const updateMutation = useMutation({
    mutationFn: updateDealerNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(dealerNotificationSettingsQueryKey, data);
    },
  });

  if (settingsQuery.isLoading) {
    return <div className="h-[520px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">알림 설정을 불러오지 못했습니다.</p>
      </section>
    );
  }

  const settings = settingsQuery.data;

  function updatePartial(patch: Partial<DealerNotificationSettings>) {
    void updateMutation.mutateAsync({
      ...settings,
      ...patch,
    });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
          Notification
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">알림 설정</h1>
        <p className="text-sm text-slate-600">
          서비스 알림과 혜택 알림을 구분해서 관리합니다. 실제 브라우저 푸시 연동은 추후 서버 정책과 함께 연결됩니다.
        </p>
      </header>

      {updateMutation.error instanceof Error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {updateMutation.error.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <NotificationSettingCard
            description="채팅 도착, 거래 상태 변경, 공지와 같이 딜러 업무에 직접 필요한 알림입니다."
            isPending={updateMutation.isPending}
            title="서비스 알림"
            value={settings.serviceAlertEnabled}
            onChange={(value) => updatePartial({ serviceAlertEnabled: value })}
          />
          <NotificationSettingCard
            description="수수료 할인, 프로모션, 이벤트 안내처럼 마케팅 성격의 알림입니다."
            isPending={updateMutation.isPending}
            title="이벤트 혜택 알림"
            value={settings.marketingAlertEnabled}
            onChange={(value) => updatePartial({ marketingAlertEnabled: value })}
          />
          <NotificationSettingCard
            description="야간 시간에는 소리와 진동을 줄이고, 다음 확인 시점에 한 번에 정리합니다."
            helperText={settings.quietHoursRangeLabel}
            isPending={updateMutation.isPending}
            title="방해 금지 시간"
            value={settings.quietHoursEnabled}
            onChange={(value) => updatePartial({ quietHoursEnabled: value })}
          />
        </div>

        <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
          <SectionCard title="전달 채널 상태">
            <div className="space-y-4">
              <StatusRow
                label="브라우저 알림"
                statusLabel={settings.browserPushEnabled ? "사용 중" : "준비 중"}
                tone={settings.browserPushEnabled ? "positive" : "neutral"}
              />
              <p className="text-sm leading-6 text-slate-600">{settings.browserPushStatusLabel}</p>
              <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                모바일 앱과 웹은 전달 채널이 다를 수 있지만, 알림 허용 여부 자체는 서버 정책 기준으로 함께 관리될 예정입니다.
              </div>
            </div>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

function NotificationSettingCard({
  title,
  description,
  value,
  isPending,
  helperText,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  isPending: boolean;
  helperText?: string;
  onChange: (nextValue: boolean) => void;
}) {
  return (
    <SectionCard title={title}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm leading-6 text-slate-600">{description}</p>
          {helperText ? <p className="text-xs font-medium text-slate-500">{helperText}</p> : null}
        </div>
        <button
          aria-pressed={value}
          className={
            value
              ? "relative inline-flex h-8 w-14 items-center rounded-full bg-slate-950 transition"
              : "relative inline-flex h-8 w-14 items-center rounded-full bg-slate-200 transition"
          }
          disabled={isPending}
          type="button"
          onClick={() => onChange(!value)}
        >
          <span
            className={
              value
                ? "absolute left-[30px] h-6 w-6 rounded-full bg-white shadow-sm transition"
                : "absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm transition"
            }
          />
        </button>
      </div>
    </SectionCard>
  );
}

function StatusRow({
  label,
  statusLabel,
  tone,
}: {
  label: string;
  statusLabel: string;
  tone: "positive" | "neutral";
}) {
  const toneClassName =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClassName}`}>
        {statusLabel}
      </span>
    </div>
  );
}
