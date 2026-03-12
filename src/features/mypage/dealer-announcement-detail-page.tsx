"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDealerAnnouncementDetailQuery } from "@/features/mypage/hooks/use-dealer-announcements-query";
import { dealerAnnouncementsQueryKey } from "@/features/mypage/lib/dealer-mypage-query";

type DealerAnnouncementDetailPageProps = {
  noticeId: string;
};

function formatAnnouncementDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function DealerAnnouncementDetailPage({
  noticeId,
}: DealerAnnouncementDetailPageProps) {
  const queryClient = useQueryClient();
  const detailQuery = useDealerAnnouncementDetailQuery(noticeId);

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    queryClient.invalidateQueries({ queryKey: dealerAnnouncementsQueryKey });
  }, [detailQuery.data, queryClient]);

  if (detailQuery.isLoading) {
    return <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-100" />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-rose-700">
          공지사항을 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  const announcement = detailQuery.data;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <article className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">{announcement.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span>{formatAnnouncementDate(announcement.createdAt)}</span>
          <span>조회수 {announcement.viewCount}</span>
        </div>
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="whitespace-pre-line text-base leading-8 text-slate-700">
            {announcement.content}
          </p>
        </div>
      </article>

      {announcement.attachments.length > 0 ? (
        <section className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">첨부 파일</h2>
          <div className="mt-4 space-y-3">
            {announcement.attachments.map((attachment) => (
              <a
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700"
                href={attachment.url}
                key={attachment.id}
              >
                <span>{attachment.name}</span>
                <span className="text-slate-400">{attachment.sizeLabel}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
