"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerReviewWorkspaceQueryKey,
  fetchDealerReviewWorkspace,
} from "@/features/mypage/lib/dealer-mypage-query";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerReviewPage() {
  const reviewQuery = useQuery({
    queryKey: dealerReviewWorkspaceQueryKey,
    queryFn: fetchDealerReviewWorkspace,
  });

  if (reviewQuery.isLoading) {
    return <div className="h-[480px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">리뷰 정보를 불러오지 못했습니다.</p>
      </section>
    );
  }

  const review = reviewQuery.data;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">Review</p>
        <h1 className="text-3xl font-semibold text-slate-950">리뷰 관리</h1>
        <p className="text-sm text-slate-600">
          앱에서는 아직 준비 중인 화면이지만, 웹에서는 향후 리뷰 운영 기준을 먼저 정리해둡니다.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="누적 리뷰" value={`${review.reviewCount}건`} />
        <MetricCard label="평균 평점" value={review.averageRating.toFixed(1)} />
      </div>

      <SectionCard title="운영 기준">
        <p className="text-sm leading-7 text-slate-600">{review.policySummary}</p>
      </SectionCard>

      <SectionCard title={review.emptyStateTitle}>
        <div className="rounded-[28px] bg-slate-50 px-6 py-14 text-center">
          <p className="text-sm leading-7 text-slate-600">{review.emptyStateDescription}</p>
        </div>
      </SectionCard>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[28px] border border-line bg-white px-5 py-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
