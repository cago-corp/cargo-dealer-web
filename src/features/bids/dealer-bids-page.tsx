"use client";

import Link from "next/link";
import { useDealerBidListQuery } from "@/features/bids/hooks/use-dealer-bid-list-query";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerBidsPage() {
  const bidListQuery = useDealerBidListQuery();
  const bidItems = bidListQuery.data ?? [];

  const summary = {
    bidding: bidItems.filter((item) => item.statusLabel === "입찰 진행").length,
    contractPending: bidItems.filter((item) => item.statusLabel === "계약 입력 대기")
      .length,
    completed: bidItems.filter((item) => item.statusLabel === "출고 완료").length,
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Bids
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 입찰</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Flutter quote_dealer의 내 입찰 탭을 실제 목록 구조로 옮겼습니다. 홈
          상세에서 제출한 입찰이 같은 세션 안에서 바로 반영됩니다.
        </p>
      </header>

      <SectionCard
        title="입찰 대시보드"
        description="모바일 대시보드의 진행 상태를 웹 상단 브리프로 재구성했습니다."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardTile label="입찰 진행" value={summary.bidding} />
          <DashboardTile label="거래 진행" value={summary.contractPending} />
          <DashboardTile label="출고 완료" value={summary.completed} />
        </div>
      </SectionCard>

      <SectionCard
        title="내 입찰 목록"
        description="경매 상태, 남은 시간, 내 순위를 한 번에 볼 수 있게 카드 밀도를 높였습니다."
      >
        {bidListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[120px] animate-pulse rounded-[28px] bg-slate-100"
                key={`bid-skeleton-${index}`}
              />
            ))}
          </div>
        ) : bidListQuery.isError ? (
          <p className="text-sm text-rose-600">
            입찰 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : bidItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">입찰 내역이 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">
              경매 상세에서 입찰을 완료하면 이 목록에 자동으로 추가됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bidItems.map((item) => (
              <Link
                className="block rounded-[28px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
                href={appRoutes.bidDetail(item.auctionId)}
                key={item.submissionId}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      {item.vehicleLabel}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.purchaseMethod} · {item.yearLabel} · {item.fuelType}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-accentSoft px-3 py-1 font-medium text-teal-800">
                      {item.statusLabel}
                    </span>
                    {item.currentRank ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        현재 {item.currentRank}위
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{item.bidCount}명 입찰</span>
                  <span>남은 시간 {formatRemainingTime(item.deadlineAt)}</span>
                  <span className="font-medium text-slate-700">상세보기</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </section>
  );
}

type DashboardTileProps = {
  label: string;
  value: number;
};

function DashboardTile({ label, value }: DashboardTileProps) {
  return (
    <div className="rounded-3xl bg-slate-950 px-5 py-5 text-white">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
