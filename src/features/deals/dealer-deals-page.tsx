"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDealerDealListQuery } from "@/features/deals/hooks/use-dealer-deal-list-query";
import { appRoutes } from "@/shared/config/routes";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useChatRail } from "@/shared/ui/chat-rail-provider";

const DEAL_PAGE_SIZE = 10;

export function DealerDealsPage() {
  const { openRoom } = useChatRail();
  const dealListQuery = useDealerDealListQuery();
  const dealItems = dealListQuery.data ?? [];
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(dealItems.length / DEAL_PAGE_SIZE));
  const pagedDealItems = dealItems.slice(
    (currentPage - 1) * DEAL_PAGE_SIZE,
    currentPage * DEAL_PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [dealItems.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const summary = {
    document: dealItems.filter((item) => item.stage === "서류 확인").length,
    contract: dealItems.filter((item) => item.stage === "계약 입력 대기").length,
    delivery: dealItems.filter((item) => item.stage === "출고 준비").length,
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-950 sm:text-xl">내 거래</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <InlineSummaryItem label="서류 확인" value={summary.document} />
          <span className="text-slate-300">|</span>
          <InlineSummaryItem label="계약 입력 대기" value={summary.contract} />
          <span className="text-slate-300">|</span>
          <InlineSummaryItem label="출고 준비" value={summary.delivery} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">내 거래 목록</h2>
        </div>
        {dealListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[140px] animate-pulse rounded-[24px] bg-slate-100 sm:h-[160px] sm:rounded-[28px]"
                key={`deal-skeleton-${index}`}
              />
            ))}
          </div>
        ) : dealListQuery.isError ? (
          <p className="text-sm text-rose-600">
            거래 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : dealItems.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">진행 중인 거래가 없습니다.</p>
            <p className="mt-2 text-sm text-slate-500">
              계약 단계로 넘어간 거래가 이 목록에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagedDealItems.map((item) => (
              <article
                className="rounded-[20px] border border-line bg-white px-4 py-3 shadow-sm sm:rounded-[22px] sm:px-5 sm:py-3.5"
                key={item.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">
                    {item.customerName}
                  </p>
                  <Link
                    className="mt-0.5 block text-base font-semibold text-slate-950 sm:text-lg"
                    href={appRoutes.dealDetail(item.id)}
                  >
                    {item.vehicleLabel}
                  </Link>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-2.5 sm:gap-2">
                  <DealStagePill stage={item.stage} />
                  <DealMetaPill>{item.purchaseMethod}</DealMetaPill>
                  <DealMetaPill>{item.deliveryRegion}</DealMetaPill>
                </div>

                <p className="mt-2 text-sm text-slate-600 sm:mt-2.5">{item.statusDescription}</p>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">
                      최근 업데이트 {formatUpdatedAt(item.updatedAt)}
                    </p>
                    <Link
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 sm:text-sm"
                      href={appRoutes.dealDetail(item.id)}
                    >
                      상세보기
                      <span aria-hidden="true">›</span>
                    </Link>
                  </div>
                  <button
                    className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:min-w-32 sm:px-5 sm:text-base"
                    disabled={
                      item.chatRoomId.startsWith("pending:") ||
                      item.stage === "출고 완료"
                    }
                    type="button"
                    onClick={() => openRoom(item.chatRoomId)}
                  >
                    채팅
                  </button>
                </div>
              </article>
            ))}

            <PaginationControls
              currentPage={currentPage}
              itemLabel="건"
              pageSize={DEAL_PAGE_SIZE}
              totalItems={dealItems.length}
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

type DealStagePillProps = {
  stage: "서류 확인" | "계약 입력 대기" | "출고 준비" | "출고 완료";
};

function DealStagePill({ stage }: DealStagePillProps) {
  const toneClassName = {
    "서류 확인": "bg-amber-50 text-amber-700",
    "계약 입력 대기": "bg-violet-50 text-violet-700",
    "출고 준비": "bg-teal-50 text-teal-700",
    "출고 완료": "bg-emerald-50 text-emerald-700",
  }[stage];

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:px-3 sm:py-1 sm:text-xs ${toneClassName}`}
    >
      {stage}
    </span>
  );
}

type DealMetaPillProps = {
  children: React.ReactNode;
};

function DealMetaPill({ children }: DealMetaPillProps) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 sm:px-3 sm:py-1 sm:text-xs">
      {children}
    </span>
  );
}

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(updatedAt));
}
