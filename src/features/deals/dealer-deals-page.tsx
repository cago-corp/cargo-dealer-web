"use client";

import Link from "next/link";
import { useDealerDealListQuery } from "@/features/deals/hooks/use-dealer-deal-list-query";
import { appRoutes } from "@/shared/config/routes";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerDealsPage() {
  const { openRoom } = useChatRail();
  const dealListQuery = useDealerDealListQuery();
  const dealItems = dealListQuery.data ?? [];

  const summary = {
    document: dealItems.filter((item) => item.stage === "서류 확인").length,
    contract: dealItems.filter((item) => item.stage === "계약 입력 대기").length,
    delivery: dealItems.filter((item) => item.stage === "출고 준비").length,
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Deals
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 거래</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          진행 중인 거래 상태를 확인하고 필요한 고객 대화로 바로 이동할 수 있습니다.
        </p>
      </header>

      <SectionCard
        title="거래 현황"
        description="지금 처리해야 할 거래 단계를 빠르게 확인하세요."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryTile label="서류 확인" value={summary.document} />
          <SummaryTile label="계약 입력 대기" value={summary.contract} />
          <SummaryTile label="출고 준비" value={summary.delivery} />
        </div>
      </SectionCard>

      <SectionCard
        title="거래 목록"
        description="고객 상태와 다음 액션을 한 번에 확인할 수 있습니다."
      >
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
            {dealItems.map((item) => (
              <article
                className="rounded-[28px] border border-line bg-white p-5 shadow-sm"
                key={item.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{item.customerName}</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      {item.vehicleLabel}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{item.statusDescription}</p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
                    {item.stage}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span>{item.purchaseMethod}</span>
                  <span>{item.deliveryRegion}</span>
                  <span>
                    최근 업데이트{" "}
                    {new Intl.DateTimeFormat("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }).format(new Date(item.updatedAt))}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                    type="button"
                    onClick={() => openRoom(item.chatRoomId)}
                  >
                    채팅 열기
                  </button>
                  <Link
                    className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
                    href={appRoutes.dealDetail(item.id)}
                  >
                    상세 보기
                  </Link>
                </div>
              </article>
            ))}
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
