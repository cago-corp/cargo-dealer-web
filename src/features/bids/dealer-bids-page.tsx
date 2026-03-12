"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDealerBidListQuery } from "@/features/bids/hooks/use-dealer-bid-list-query";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { PaginationControls } from "@/shared/ui/pagination-controls";

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
    <section className="space-y-4 sm:space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-950 sm:text-xl">내 입찰</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <InlineSummaryItem label="입찰 진행" value={summary.bidding} />
          <span className="text-slate-300">|</span>
          <InlineSummaryItem label="거래 진행" value={summary.contractPending} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">내 입찰 목록</h2>
        </div>
        {bidListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[104px] animate-pulse rounded-[24px] bg-slate-100 sm:h-[120px] sm:rounded-[28px]"
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
                className="block rounded-[20px] border border-line bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm sm:rounded-[24px] sm:px-5 sm:py-4"
                href={appRoutes.bidDetail(item.auctionId)}
                key={item.submissionId}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                      {item.vehicleLabel}
                    </h2>
                    {item.statusLabel === "입찰 진행" ? (
                      <StatusPill tone="timer">
                        {formatRemainingTime(item.deadlineAt)}
                      </StatusPill>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:mt-2 sm:text-sm">
                    <PurchaseMethodPill method={item.purchaseMethod} />
                    <span className="whitespace-nowrap">{item.yearLabel}</span>
                    <span className="text-slate-300">•</span>
                    <span className="whitespace-nowrap">{item.fuelType}</span>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 sm:mt-3">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <StatusPill tone={getBidStatusTone(item.statusLabel)}>
                      {item.statusLabel}
                    </StatusPill>
                    <StatusPill tone="neutral">{item.bidCount}명 입찰</StatusPill>
                    {item.currentRank ? (
                      <StatusPill tone="neutral">현재 {item.currentRank}위</StatusPill>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 sm:gap-2 sm:text-sm">
                    <span className="font-medium text-slate-700">상세보기</span>
                    <span aria-hidden="true">›</span>
                  </div>
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
      </section>
    </section>
  );
}

type InlineSummaryItemProps = {
  label: string;
  value: number;
};

function InlineSummaryItem({ label, value }: InlineSummaryItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-slate-500 sm:text-sm">{label}</span>
      <span className="text-base font-semibold text-slate-950 sm:text-lg">{value}</span>
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
    <span
      className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${toneClassName}`}
    >
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
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${toneClassName}`}
    >
      {children}
    </span>
  );
}
