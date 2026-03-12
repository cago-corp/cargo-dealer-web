"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DealerDealActionPanel } from "@/features/deals/components/dealer-deal-action-panel";
import { DealerDealStepper } from "@/features/deals/components/dealer-deal-stepper";
import { useDealerDealDetailQuery } from "@/features/deals/hooks/use-dealer-deal-detail-query";
import { appRoutes } from "@/shared/config/routes";
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
  const dealDetailQuery = useDealerDealDetailQuery(dealId);
  const searchParams = useSearchParams();
  const [showContractUpdatedNotice, setShowContractUpdatedNotice] = useState(
    searchParams.get("contractUpdated") === "1",
  );

  useEffect(() => {
    if (searchParams.get("contractUpdated") !== "1") {
      return;
    }

    setShowContractUpdatedNotice(true);
    window.history.replaceState(window.history.state, "", appRoutes.dealDetail(dealId));
  }, [dealId, searchParams]);

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
  const headerMetadata = [
    detail.purchaseMethod,
    detail.deliveryRegion,
    `최근 업데이트 ${formatDateLabel(detail.updatedAt)}`,
  ].filter(Boolean);

  return (
    <section className="space-y-4 sm:space-y-6">
      {showContractUpdatedNotice ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 sm:rounded-[28px] sm:px-5 sm:py-4">
          최종 계약이 전송되었습니다. 고객 계약 전까지는 언제든 다시 열어 수정할 수 있습니다.
        </div>
      ) : null}

      <header className="rounded-[24px] border border-white/80 bg-white px-4 py-4 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 sm:text-sm">{detail.customerName}</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
              {detail.vehicleLabel}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">{headerMetadata.join(" · ")}</p>
            <p className="mt-1 text-sm text-slate-600">
              {(detail.vehicleExteriorColorName ?? "외장 무관")} · {(detail.vehicleInteriorColorName ?? "내장 무관")}
            </p>
          </div>
          <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-medium text-white sm:px-4 sm:py-2 sm:text-sm">
            {detail.stage}
          </span>
        </div>
      </header>

      <div className="space-y-6">
        <DetailSection title="진행 단계">
          <div className="space-y-4 sm:space-y-5">
            <DealerDealStepper statusCode={detail.statusCode} />
            <DealerDealActionPanel detail={detail} />
          </div>
        </DetailSection>

        <DetailSection title={`${detail.purchaseMethod} 조건`}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 xl:grid-cols-4">
            <DetailField label="차량가" value={detail.askingPriceLabel} />
            <DetailField
              label="계약 기간"
              value={detail.contractMonths ? `${detail.contractMonths}개월` : "-"}
            />
            <DetailField
              label="선납금"
              value={formatWon(detail.advanceDownPaymentAmount)}
            />
            <DetailField
              label="보증금"
              value={formatWon(detail.depositDownPaymentAmount)}
            />
            <DetailField
              label="연간 주행거리"
              value={
                detail.annualMileage
                  ? `${new Intl.NumberFormat("ko-KR").format(detail.annualMileage)}km`
                  : "-"
              }
            />
            <DetailField label="고객 구분" value={detail.customerType ?? "-"} />
          </div>
        </DetailSection>

        <DetailSection title="출고 서비스 및 메모">
          <div className="space-y-4">
            {detail.services.length === 0 ? (
              <p className="text-sm text-slate-500">선택된 서비스가 없습니다.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {detail.services.map((service) => (
                  <div className="rounded-2xl bg-slate-50 px-4 py-4" key={service.id}>
                    <p className="text-sm font-semibold text-slate-950">{service.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{service.description}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm font-semibold text-slate-950">메모</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{detail.note}</p>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="거래 정보">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3 xl:grid-cols-4">
            <DetailField label="고객명" value={detail.customerName} />
            <DetailField label="연락처" value={detail.customerPhone ?? "-"} />
            <DetailField label="외장 컬러" value={detail.vehicleExteriorColorName ?? "무관"} />
            <DetailField label="내장 컬러" value={detail.vehicleInteriorColorName ?? "무관"} />
            <DetailField label="입찰 제출 시각" value={formatDateLabel(detail.submittedAt)} />
          </div>
        </DetailSection>
      </div>
    </section>
  );
}

type DetailSectionProps = {
  title: string;
  children: React.ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="rounded-[24px] border border-white/80 bg-white px-4 py-4 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-6">
      <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">{title}</h2>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-950 sm:mt-1.5 sm:text-base">
        {value}
      </p>
    </div>
  );
}
