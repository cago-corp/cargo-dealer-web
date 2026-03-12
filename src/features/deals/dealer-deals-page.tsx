"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDealerDealListQuery } from "@/features/deals/hooks/use-dealer-deal-list-query";
import { appRoutes } from "@/shared/config/routes";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { SectionCard } from "@/shared/ui/section-card";

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
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Deals
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 거래</h1>
      </header>

      <SectionCard title="거래 현황">
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label="서류 확인" value={summary.document} />
          <SummaryTile label="계약 입력 대기" value={summary.contract} />
          <SummaryTile label="출고 준비" value={summary.delivery} />
        </div>
      </SectionCard>

      <SectionCard title="거래 목록">
        {dealListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[160px] animate-pulse rounded-[28px] bg-slate-100"
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
                className="rounded-[22px] border border-line bg-white px-5 py-3.5 shadow-sm"
                key={item.id}
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-500">
                      {item.customerName}
                    </p>
                    <Link
                      className="mt-0.5 block text-lg font-semibold text-slate-950"
                      href={appRoutes.dealDetail(item.id)}
                    >
                      {item.vehicleLabel}
                    </Link>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 underline underline-offset-4"
                      href={appRoutes.dealDetail(item.id)}
                    >
                      상세보기
                      <span aria-hidden="true">›</span>
                    </Link>
                  </div>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <DealStagePill stage={item.stage} />
                  <DealMetaPill>{item.purchaseMethod}</DealMetaPill>
                  <DealMetaPill>{item.deliveryRegion}</DealMetaPill>
                </div>

                <p className="mt-2.5 text-sm text-slate-600">{item.statusDescription}</p>

                <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
                  <p className="text-xs text-slate-400">
                    최근 업데이트 {formatUpdatedAt(item.updatedAt)}
                  </p>
                  <button
                    className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto sm:min-w-32"
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
      </SectionCard>
    </section>
  );
}

type SummaryTileProps = {
  label: string;
  value: number;
};

function SummaryTile({ label, value }: SummaryTileProps) {
  return (
    <div className="rounded-3xl bg-slate-950 px-5 py-5 text-white">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
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
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClassName}`}>
      {stage}
    </span>
  );
}

type DealMetaPillProps = {
  children: React.ReactNode;
};

function DealMetaPill({ children }: DealMetaPillProps) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
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
