"use client";

import { useDealerQuoteListQuery } from "@/features/quotes/hooks/use-dealer-quote-list-query";
import { SectionCard } from "@/shared/ui/section-card";

const statusLabel: Record<string, string> = {
  open: "신규",
  bidding: "입찰 중",
  won: "낙찰",
  closed: "종료",
};

export function DealerQuoteList() {
  const quoteListQuery = useDealerQuoteListQuery();
  const quoteItems = quoteListQuery.data ?? [];

  if (quoteListQuery.isLoading) {
    return (
      <SectionCard title="견적 파이프라인" description="TanStack Query 연결 준비">
        <p className="text-sm text-slate-500">견적 목록을 불러오는 중입니다.</p>
      </SectionCard>
    );
  }

  if (quoteListQuery.isError) {
    return (
      <SectionCard title="견적 파이프라인" description="TanStack Query 연결 준비">
        <p className="text-sm text-rose-600">견적 목록을 불러오지 못했습니다.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="견적 파이프라인"
      description="Flutter quote_dealer의 입찰/거래 흐름을 웹 테이블 중심 경험으로 확장할 자리입니다."
    >
      <div className="space-y-3">
        {quoteItems.map((quote) => (
          <article
            key={quote.id}
            className="grid gap-3 rounded-3xl border border-line bg-white p-5 lg:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{quote.id}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                {quote.vehicleLabel}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                고객 {quote.customerName} · 입찰 {quote.bidCount}건
              </p>
            </div>
            <div className="self-center">
              <span className="rounded-full bg-accentSoft px-3 py-1 text-sm font-medium text-teal-800">
                {statusLabel[quote.status]}
              </span>
            </div>
            <p className="self-center text-sm text-slate-500">{quote.receivedAt}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
