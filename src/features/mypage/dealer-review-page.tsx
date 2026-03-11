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
    return <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">리뷰 정보를 불러오지 못했습니다.</p>
      </section>
    );
  }

  const review = reviewQuery.data;
  const maxBucketCount = Math.max(...review.ratingBreakdown.map((bucket) => bucket.count), 1);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-950">리뷰 관리</h1>
        <p className="text-sm leading-6 text-slate-600">
          앱에서는 아직 준비 중인 메뉴지만, 웹에서는 최근 리뷰와 평점 흐름을 한 번에 확인할 수 있게
          먼저 정리했습니다.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="리뷰 요약">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1fr]">
            <div className="rounded-[28px] bg-slate-50 px-6 py-6">
              <p className="text-sm text-slate-500">평균 평점</p>
              <div className="mt-3 flex items-end gap-3">
                <p className="text-5xl font-semibold tracking-tight text-slate-950">
                  {review.averageRating.toFixed(1)}
                </p>
                <p className="pb-2 text-sm text-slate-500">/ 5.0</p>
              </div>
              <div className="mt-3 flex gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} className="text-lg">
                    {index < Math.round(review.averageRating) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                누적 리뷰 {review.reviewCount}건
                <br />
                {review.recentSummary}
              </p>
            </div>

            <div className="space-y-4">
              {review.ratingBreakdown
                .slice()
                .sort((left, right) => right.score - left.score)
                .map((bucket) => (
                  <div key={bucket.score} className="grid grid-cols-[44px_1fr_36px] items-center gap-3">
                    <p className="text-sm font-medium text-slate-700">{bucket.score}점</p>
                    <div className="h-2.5 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${Math.max((bucket.count / maxBucketCount) * 100, bucket.count > 0 ? 10 : 0)}%`,
                        }}
                      />
                    </div>
                    <p className="text-right text-sm text-slate-500">{bucket.count}</p>
                  </div>
                ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="운영 메모">
          <div className="space-y-4 rounded-[28px] bg-slate-50 px-6 py-6">
            <ReviewNote
              label="정책"
              value={review.policySummary}
            />
            <ReviewNote
              label="관리 포인트"
              value="낮은 평점 리뷰는 거래 단계와 응답 속도를 함께 확인하는 기준으로 사용합니다."
            />
            <ReviewNote
              label="현재 상태"
              value="리뷰 신고/숨김 처리는 추후 운영 정책과 함께 실제 기능으로 연결할 예정입니다."
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard title="최근 리뷰">
        <div className="space-y-4">
          {review.recentReviews.map((item) => (
            <article
              key={item.id}
              className="rounded-[28px] border border-line bg-white px-5 py-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base text-amber-500">
                    {"★".repeat(item.rating)}
                    <span className="text-slate-300">{"★".repeat(5 - item.rating)}</span>
                  </span>
                  <span className="text-sm font-medium text-slate-700">{item.rating}.0</span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.flagged
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {item.statusLabel}
                </span>
                <span className="text-sm text-slate-400">{formatReviewDate(item.createdAt)}</span>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-slate-950">{item.title}</p>
                <p className="text-sm font-medium text-slate-600">
                  {item.customerName} · {item.vehicleLabel}
                </p>
                <p className="text-sm leading-7 text-slate-600">{item.body}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}

function ReviewNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="text-sm leading-6 text-slate-600">{value}</p>
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(date);
}
