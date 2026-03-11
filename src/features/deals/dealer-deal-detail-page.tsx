"use client";

import Link from "next/link";
import { useDealerDealDetailQuery } from "@/features/deals/hooks/use-dealer-deal-detail-query";
import { appRoutes } from "@/shared/config/routes";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { SectionCard } from "@/shared/ui/section-card";

type DealerDealDetailPageProps = {
  dealId: string;
};

function formatWon(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DealerDealDetailPage({ dealId }: DealerDealDetailPageProps) {
  const { openRoom } = useChatRail();
  const dealDetailQuery = useDealerDealDetailQuery(dealId);

  if (dealDetailQuery.isLoading) {
    return <div className="h-[420px] animate-pulse rounded-[28px] bg-slate-100" />;
  }

  if (dealDetailQuery.isError || !dealDetailQuery.data) {
    return (
      <SectionCard title="거래 상세" description="거래 정보를 불러오지 못했습니다.">
        <p className="text-sm text-rose-600">잠시 후 다시 시도해 주세요.</p>
      </SectionCard>
    );
  }

  const detail = dealDetailQuery.data;
  const isChatReady = !detail.chatRoomId.startsWith("pending:");

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-white/80 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{detail.customerName}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              {detail.vehicleLabel}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {detail.purchaseMethod} · {detail.deliveryRegion} · 최근 업데이트{" "}
              {formatDateLabel(detail.updatedAt)}
            </p>
          </div>
          <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            {detail.stage}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          {detail.statusDescription}
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionCard
            title="진행 단계"
            description="현재 거래가 어느 단계까지 진행되었는지 한눈에 확인할 수 있습니다."
          >
            <div className="grid gap-3 md:grid-cols-3">
              {detail.steps.map((step) => (
                <div
                  className={
                    step.state === "current"
                      ? "rounded-3xl border border-slate-950 bg-slate-950 px-4 py-5 text-white"
                      : step.state === "completed"
                        ? "rounded-3xl border border-teal-200 bg-teal-50 px-4 py-5 text-teal-800"
                        : "rounded-3xl border border-line bg-slate-50 px-4 py-5 text-slate-500"
                  }
                  key={step.label}
                >
                  <p className="text-sm font-medium">{step.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={`${detail.purchaseMethod} 조건`}
            description="고객 요청 조건과 현재 제안 내용을 함께 볼 수 있습니다."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Metric label="차량가" value={detail.askingPriceLabel} />
              <Metric
                label="계약 기간"
                value={detail.contractMonths ? `${detail.contractMonths}개월` : "-"}
              />
              <Metric
                label="선납금"
                value={formatWon(detail.advanceDownPaymentAmount)}
              />
              <Metric
                label="보증금"
                value={formatWon(detail.depositDownPaymentAmount)}
              />
              <Metric
                label="연간 주행거리"
                value={
                  detail.annualMileage
                    ? `${new Intl.NumberFormat("ko-KR").format(detail.annualMileage)}km`
                    : "-"
                }
              />
              <Metric label="고객 구분" value={detail.customerType ?? "-"} />
            </div>
          </SectionCard>

          <SectionCard
            title="출고 서비스 및 메모"
            description="거래 진행 중 필요한 서비스와 전달 메모를 확인하세요."
          >
            <div className="space-y-4 rounded-3xl bg-slate-50 p-5">
              {detail.services.length === 0 ? (
                <p className="text-sm text-slate-500">선택된 서비스가 없습니다.</p>
              ) : (
                detail.services.map((service) => (
                  <div key={service.id}>
                    <p className="text-sm font-semibold text-slate-950">{service.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                  </div>
                ))
              )}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm font-semibold text-slate-950">메모</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail.note}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="고객 정보"
            description="연락과 출고 조율에 필요한 기본 정보를 확인할 수 있습니다."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Metric label="고객명" value={detail.customerName} />
              <Metric label="연락처" value={detail.customerPhone ?? "-"} />
              <Metric
                label="외장 / 내장 컬러"
                value={`${detail.vehicleExteriorColorName ?? "무관"} / ${detail.vehicleInteriorColorName ?? "무관"}`}
              />
              <Metric label="입찰 제출 시각" value={formatDateLabel(detail.submittedAt)} />
            </div>
          </SectionCard>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="바로가기"
            description="채팅과 거래 목록을 빠르게 오갈 수 있습니다."
          >
            <div className="space-y-3">
              <button
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!isChatReady}
                type="button"
                onClick={() => openRoom(detail.chatRoomId)}
              >
                채팅 열기
              </button>
              <Link
                className="block rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
                href={appRoutes.deals()}
              >
                거래 목록으로
              </Link>
            </div>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
