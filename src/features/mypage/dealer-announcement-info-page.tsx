"use client";

import { useDealerAnnouncementInfoDetailQuery } from "@/features/mypage/hooks/use-dealer-announcements-query";

type DealerAnnouncementInfoPageProps = {
  infoId: string;
};

export function DealerAnnouncementInfoPage({
  infoId,
}: DealerAnnouncementInfoPageProps) {
  const infoQuery = useDealerAnnouncementInfoDetailQuery(infoId);

  if (infoQuery.isLoading) {
    return <div className="h-[280px] animate-pulse rounded-[28px] bg-slate-100" />;
  }

  if (infoQuery.isError || !infoQuery.data) {
    return (
      <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-base font-semibold text-rose-700">
          안내 정보를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <article className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
          Information
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {infoQuery.data.title}
        </h1>
        <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
          {infoQuery.data.content}
        </p>
      </article>
    </section>
  );
}
