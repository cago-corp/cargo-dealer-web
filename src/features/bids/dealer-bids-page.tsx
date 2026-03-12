"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDealerBidListQuery } from "@/features/bids/hooks/use-dealer-bid-list-query";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { SectionCard } from "@/shared/ui/section-card";

const BID_PAGE_SIZE = 10;

export function DealerBidsPage() {
  const bidListQuery = useDealerBidListQuery();
  const allBidItems = bidListQuery.data ?? [];
  const bidItems = allBidItems.filter(
    (item) => item.statusLabel !== "종료" && item.statusLabel !== "출고 완료",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(bidItems.length / BID_PAGE_SIZE));
  const pagedBidItems = bidItems.slice(
    (currentPage - 1) * BID_PAGE_SIZE,
    currentPage * BID_PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [bidItems.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const summary = {
    bidding: bidItems.filter((item) => item.statusLabel === "입찰 진행").length,
    contractPending: bidItems.filter((item) => item.statusLabel === "계약 입력 대기")
      .length,
  };

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Bids
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 입찰</h1>
      </header>

      <SectionCard title="입찰 대시보드">
        <div className="grid gap-4 md:grid-cols-2">
          <DashboardTile label="입찰 진행" value={summary.bidding} />
          <DashboardTile label="거래 진행" value={summary.contractPending} />
        </div>
      </SectionCard>

      <SectionCard title="내 입찰 목록">
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
            <p className="text-lg font-semibold text-slate-900">
              진행 중인 입찰이 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              종료된 입찰은 추후 별도 보관 화면에서 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagedBidItems.map((item) => (
              <Link
                className="block rounded-[24px] border border-line bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
                href={appRoutes.bidDetail(item.auctionId)}
                key={item.submissionId}
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-semibold text-slate-950">
                        {item.vehicleLabel}
                      </h2>
                      {item.statusLabel === "입찰 진행" ? (
                        <StatusPill tone="timer">
                          {formatRemainingTime(item.deadlineAt)}
                        </StatusPill>
                      ) : null}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <PurchaseMethodPill method={item.purchaseMethod} />
                      <span className="whitespace-nowrap">{item.yearLabel}</span>
                      <span className="text-slate-300">•</span>
                      <span className="whitespace-nowrap">{item.fuelType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">상세보기</span>
                    <span aria-hidden="true">›</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill tone={getBidStatusTone(item.statusLabel)}>
                    {item.statusLabel}
                  </StatusPill>
                  <StatusPill tone="neutral">{item.bidCount}명 입찰</StatusPill>
                  {item.currentRank ? (
                    <StatusPill tone="neutral">현재 {item.currentRank}위</StatusPill>
                  ) : null}
                </div>
              </Link>
            ))}

            <PaginationControls
              currentPage={currentPage}
              itemLabel="건"
              pageSize={BID_PAGE_SIZE}
              totalItems={bidItems.length}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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

function getBidStatusTone(statusLabel: string) {
  switch (statusLabel) {
    case "입찰 진행":
      return "progress" as const;
    case "계약 입력 대기":
      return "warning" as const;
    case "출고 완료":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

type PurchaseMethodPillProps = {
  method: "현금" | "할부" | "리스" | "장기렌트";
};

function PurchaseMethodPill({ method }: PurchaseMethodPillProps) {
  const toneClassName = {
    현금: "bg-emerald-50 text-emerald-700",
    할부: "bg-amber-50 text-amber-700",
    리스: "bg-slate-100 text-slate-700",
    장기렌트: "bg-sky-50 text-sky-700",
  }[method];

  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${toneClassName}`}>
      {method}
    </span>
  );
}

type StatusPillProps = {
  children: React.ReactNode;
  tone: "neutral" | "progress" | "success" | "timer" | "warning";
};

function StatusPill({ children, tone }: StatusPillProps) {
  const toneClassName = {
    neutral: "bg-slate-100 text-slate-700",
    progress: "bg-violet-50 text-violet-700",
    success: "bg-emerald-50 text-emerald-700",
    timer: "border border-violet-200 bg-white text-violet-700",
    warning: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClassName}`}>
      {children}
    </span>
  );
}
