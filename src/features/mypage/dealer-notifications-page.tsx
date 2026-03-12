"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type {
  DealerNotificationItem,
  DealerNotificationTarget,
} from "@/entities/notification/schemas/dealer-notification-schema";
import { useDealerNotificationsQuery } from "@/features/mypage/hooks/use-dealer-notifications-query";
import { dealerAnnouncementsQueryKey, dealerNotificationsQueryKey } from "@/features/mypage/lib/dealer-mypage-query";
import {
  markAllDealerNotificationsAsRead,
  markDealerNotificationAsRead,
} from "@/shared/api/dealer-mypage";
import { appRoutes } from "@/shared/config/routes";
import { formatRelativeTime } from "@/shared/lib/format/format-relative-time";

function resolveNotificationHref(target: DealerNotificationTarget) {
  switch (target.kind) {
    case "chat":
      return appRoutes.chat(target.value ?? undefined);
    case "deal":
      return target.value ? appRoutes.dealDetail(target.value) : null;
    case "bid":
      return target.value ? appRoutes.bidDetail(target.value) : null;
    case "announcement":
      return target.value ? appRoutes.mypageAnnouncementDetail(target.value) : null;
    case "announcement_info":
      return target.value ? appRoutes.mypageAnnouncementInfoDetail(target.value) : null;
    case "review":
      return appRoutes.mypageReview();
    case "interested_vehicle":
      return appRoutes.mypageInterestedVehicles();
    case "notification_settings":
      return appRoutes.mypageNotificationSettings();
    case "terms":
      return appRoutes.mypageTerms();
    case "customer_service":
      return appRoutes.mypageCustomerService();
    default:
      return null;
  }
}

export function DealerNotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationsQuery = useDealerNotificationsQuery();

  const markAllMutation = useMutation({
    mutationFn: markAllDealerNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerNotificationsQueryKey });
    },
  });

  const openNotificationMutation = useMutation({
    mutationFn: async (item: DealerNotificationItem) => {
      await markDealerNotificationAsRead(item.id);
      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: dealerNotificationsQueryKey });
      queryClient.invalidateQueries({ queryKey: dealerAnnouncementsQueryKey });

      const href = resolveNotificationHref(item.target);

      if (href) {
        router.push(href);
      }
    },
  });

  const items = notificationsQuery.data ?? [];

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Notifications
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">알림</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            거래, 채팅, 공지 관련 업데이트를 한 곳에서 확인할 수 있습니다.
          </p>
        </div>
        <button
          className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={markAllMutation.isPending || items.length === 0}
          type="button"
          onClick={() => markAllMutation.mutate()}
        >
          {markAllMutation.isPending ? "처리 중..." : "모두 읽음으로 표시"}
        </button>
      </header>

      <section className="overflow-hidden rounded-[32px] border border-line bg-white shadow-sm">
        {notificationsQuery.isLoading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-[96px] animate-pulse rounded-[24px] bg-slate-100"
                key={`notification-skeleton-${index}`}
              />
            ))}
          </div>
        ) : notificationsQuery.isError ? (
          <div className="px-6 py-12 text-center">
            <p className="text-base font-semibold text-rose-700">
              알림을 불러오지 못했습니다.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">새로운 알림이 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">
              거래와 채팅 관련 알림이 생기면 이 목록에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <button
                key={item.id}
                className={
                  item.highlighted
                    ? "flex w-full items-start gap-4 bg-teal-50/60 px-6 py-5 text-left transition hover:bg-teal-50"
                    : "flex w-full items-start gap-4 bg-white px-6 py-5 text-left transition hover:bg-slate-50"
                }
                type="button"
                onClick={() => openNotificationMutation.mutate(item)}
              >
                <div
                  className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notificationPalette[item.type]}`}
                >
                  {notificationIcon[item.type]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <p className="flex-1 text-base font-semibold text-slate-950">
                      {item.title}
                    </p>
                    {item.isUnread ? (
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.body}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

const notificationPalette = {
  system: "bg-emerald-50 text-emerald-700",
  chat: "bg-amber-50 text-amber-700",
  auction: "bg-sky-50 text-sky-700",
} as const;

const notificationIcon = {
  system: "✓",
  chat: "✉",
  auction: "◔",
} as const;
