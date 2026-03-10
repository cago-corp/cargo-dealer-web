"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDealerAnnouncementInfoQuery, useDealerAnnouncementsInfiniteQuery } from "@/features/mypage/hooks/use-dealer-announcements-query";
import { dealerAnnouncementsQueryKey } from "@/features/mypage/lib/dealer-mypage-query";
import { appRoutes } from "@/shared/config/routes";

function formatAnnouncementDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function DealerAnnouncementsPage() {
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const infoQuery = useDealerAnnouncementInfoQuery();
  const announcementsQuery = useDealerAnnouncementsInfiniteQuery();
  const items = announcementsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = announcementsQuery;

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  ]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Announcements
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">공지사항</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            운영 정책과 주요 공지 업데이트를 최신 순으로 확인할 수 있습니다.
          </p>
        </div>
        <button
          className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
          type="button"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: dealerAnnouncementsQueryKey });
          }}
        >
          새로고침
        </button>
      </header>

      {infoQuery.data?.content ? (
        <Link
          className="block rounded-[28px] bg-slate-100 px-5 py-4 text-sm leading-6 text-slate-700"
          href={appRoutes.mypageAnnouncementInfoDetail(infoQuery.data.id)}
        >
          <span className="mr-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
            안내
          </span>
          {infoQuery.data.content}
        </Link>
      ) : null}

      <section className="space-y-3">
        {announcementsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              className="h-[136px] animate-pulse rounded-[28px] bg-slate-100"
              key={`announcement-skeleton-${index}`}
            />
          ))
        ) : announcementsQuery.isError ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
            <p className="text-base font-semibold text-rose-700">
              공지사항을 불러오지 못했습니다.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          items.map((item) => (
            <Link
              className="block rounded-[28px] border border-line bg-white p-5 shadow-sm transition hover:border-slate-300"
              href={appRoutes.mypageAnnouncementDetail(item.id)}
              key={item.id}
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-3">
                    <h2
                      className={
                        item.isRead
                          ? "flex-1 text-lg font-semibold text-slate-500"
                          : "flex-1 text-lg font-semibold text-slate-950"
                      }
                    >
                      {item.title}
                    </h2>
                    {item.isNew ? (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        NEW
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {item.content}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-sm text-slate-400">
                <span>조회수 {item.viewCount}</span>
                <span>{formatAnnouncementDate(item.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </section>

      {hasNextPage ? (
        <div ref={sentinelRef} className="py-4 text-center text-sm text-slate-500">
          {isFetchingNextPage
            ? "공지사항을 더 불러오는 중..."
            : "아래로 스크롤하면 더 불러옵니다."}
        </div>
      ) : null}
    </section>
  );
}
