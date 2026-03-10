"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealerAuctionDetail } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { getDealerBidDetailQueryKey } from "@/features/bids/lib/dealer-bid-query";
import { toggleDealerAuctionFavoriteFromApi } from "@/features/home/lib/dealer-home-api";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import {
  dealerAuctionDetailQueryRoot,
  useDealerAuctionDetailQuery,
} from "@/features/home/hooks/use-dealer-auction-detail-query";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { CachedImage } from "@/shared/ui/cached-image";
import { SectionCard } from "@/shared/ui/section-card";

type DealerAuctionDetailPageProps = {
  auctionId: string;
};

const statusTone = {
  경매중: "bg-sky-50 text-sky-700",
  "마감 임박": "bg-rose-50 text-rose-700",
  "내 입찰 진행": "bg-violet-50 text-violet-700",
  "계약 진행": "bg-emerald-50 text-emerald-700",
  "경매 종료": "bg-slate-200 text-slate-600",
} as const;

function formatWon(value: number) {
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

function buildConditionEntries(auction: DealerAuctionDetail) {
  if (auction.purchaseMethod === "현금") {
    return [
      { label: "공채용 지역", value: auction.userRegion },
      { label: "배송 지역", value: auction.deliveryRegion },
      {
        label: "컬러",
        value: `${auction.vehicleExteriorColorName ?? "색상 무관"} / ${auction.vehicleInteriorColorName ?? "색상 무관"}`,
      },
      { label: "희망 출고일", value: "협의 필요" },
    ];
  }

  if (auction.purchaseMethod === "할부") {
    return [
      {
        label: "할부 기간",
        value: auction.contractMonths ? `${auction.contractMonths}개월` : "-",
      },
      {
        label: "선납금",
        value: auction.advanceDownPaymentAmount
          ? formatWon(auction.advanceDownPaymentAmount)
          : "-",
      },
      { label: "공채용 지역", value: auction.userRegion },
      { label: "배송 지역", value: auction.deliveryRegion },
    ];
  }

  return [
    {
      label: "이용 기간",
      value: auction.contractMonths ? `${auction.contractMonths}개월` : "-",
    },
    {
      label: "선납금",
      value: auction.advanceDownPaymentAmount
        ? formatWon(auction.advanceDownPaymentAmount)
        : "-",
    },
    {
      label: "보증금",
      value: auction.depositDownPaymentAmount
        ? formatWon(auction.depositDownPaymentAmount)
        : "-",
    },
    {
      label: "연간 주행거리",
      value: auction.annualMileage
        ? `${new Intl.NumberFormat("ko-KR").format(auction.annualMileage)}km`
        : "-",
    },
    { label: "고객 구분", value: auction.customerType ?? "-" },
    { label: "배송 지역", value: auction.deliveryRegion },
  ];
}

function buildQuickFacts(auction: DealerAuctionDetail) {
  const facts = [
    { label: "판매자", value: auction.sellerName },
    { label: "구매 방식", value: auction.purchaseMethod },
    { label: "고객 지역", value: auction.userRegion },
    { label: "배송 지역", value: auction.deliveryRegion },
    { label: "연식", value: auction.yearLabel },
    { label: "연료", value: auction.fuelType },
  ];

  if (auction.purchaseMethod === "리스") {
    facts.push({
      label: "연간 주행거리",
      value: auction.annualMileage
        ? `${new Intl.NumberFormat("ko-KR").format(auction.annualMileage)}km`
        : "-",
    });
  }

  if (auction.customerType) {
    facts.push({ label: "고객 구분", value: auction.customerType });
  }

  return facts;
}

function resolvePrimaryAction(auction: DealerAuctionDetail) {
  if (auction.myBidSubmissionId) {
    return {
      href: appRoutes.bidDetail(auction.id),
      label: "내 입찰 보기",
      disabled: false,
    };
  }

  if (auction.statusCode === "경매 종료") {
    return {
      href: "",
      label: "경매 종료",
      disabled: true,
    };
  }

  return {
    href: appRoutes.homeAuctionBidWizard(auction.id),
    label: "입찰하기",
    disabled: false,
  };
}

export function DealerAuctionDetailPage({
  auctionId,
}: DealerAuctionDetailPageProps) {
  const queryClient = useQueryClient();
  const auctionDetailQuery = useDealerAuctionDetailQuery(auctionId);
  const favoriteMutation = useMutation({
    mutationFn: toggleDealerAuctionFavoriteFromApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: dealerAuctionDetailQueryRoot });
      queryClient.invalidateQueries({ queryKey: getDealerBidDetailQueryKey(auctionId) });
    },
  });

  if (auctionDetailQuery.isLoading) {
    return (
      <section className="space-y-5">
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
              <div className="h-[280px] animate-pulse bg-slate-100" />
              <div className="space-y-4 px-6 py-6">
                <div className="h-5 w-40 animate-pulse rounded-full bg-slate-100" />
                <div className="h-9 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      className="h-[84px] animate-pulse rounded-[22px] bg-slate-100"
                      key={`auction-detail-metric-${index}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="h-[220px] animate-pulse rounded-[28px] bg-slate-100" />
          </div>
          <div className="space-y-4">
            <div className="h-[220px] animate-pulse rounded-[28px] bg-slate-100" />
            <div className="h-[180px] animate-pulse rounded-[28px] bg-slate-100" />
          </div>
        </div>
      </section>
    );
  }

  if (auctionDetailQuery.isError || !auctionDetailQuery.data) {
    return (
      <SectionCard title="경매 상세" description="상세 정보를 불러오지 못했습니다.">
        <p className="text-sm text-rose-600">잠시 후 다시 시도해 주세요.</p>
      </SectionCard>
    );
  }

  const auction = auctionDetailQuery.data;
  const primaryAction = resolvePrimaryAction(auction);
  const conditionEntries = buildConditionEntries(auction);
  const remainingTime = formatRemainingTime(auction.deadlineAt);
  const summaryMetrics = [
    { label: "차량가", value: auction.askingPriceLabel },
    { label: "남은 시간", value: remainingTime },
    { label: "마감 시각", value: formatDateLabel(auction.deadlineAt) },
    {
      label: "입찰 / 조회",
      value: `${auction.bidCount.toLocaleString("ko-KR")}명 / ${auction.viewCount.toLocaleString("ko-KR")}회`,
    },
  ] as const;
  const quickFacts = buildQuickFacts(auction);

  return (
    <section className="space-y-5">
      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
            <div className="relative h-[280px] bg-slate-100">
              <CachedImage
                alt={`${auction.brandName} ${auction.modelName}`}
                className="object-cover"
                fallback={
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 text-3xl font-semibold tracking-[0.2em] text-slate-300">
                    CAR
                  </div>
                }
                priority
                sizes="(min-width: 1536px) 860px, 100vw"
                src={auction.imageUrl}
              />
            </div>

            <div className="px-6 py-6">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-start 2xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusTone[auction.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {auction.statusLabel}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {auction.purchaseMethod}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-semibold text-slate-950">
                  {auction.brandName} {auction.modelName} {auction.trimName}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {auction.sellerName} · {auction.yearLabel} · {auction.fuelType} ·{" "}
                  {auction.regionLabel}
                </p>
                {auction.description ? (
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
                    {auction.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2 2xl:w-[360px] 2xl:shrink-0">
                {summaryMetrics.map((metric) => (
                  <SummaryMetric
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              {quickFacts.map((fact) => (
                <DetailMetric key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </div>
            </div>
          </section>

          <SectionCard
            title={`${auction.purchaseMethod} 조건`}
            description="입찰 전에 확인해야 할 고객 요청 조건입니다."
          >
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {conditionEntries.map((entry) => (
                <DetailMetric key={entry.label} label={entry.label} value={entry.value} />
              ))}
            </div>

            {auction.myBidSubmissionId ? (
              <div className="mt-5 flex justify-end">
                <Link
                  className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
                  href={appRoutes.bidDetail(auction.id)}
                >
                  신청내역 상세보기
                </Link>
              </div>
            ) : null}
          </SectionCard>

          {auction.description ? (
            <SectionCard
              title="고객 요청 메모"
              description="입찰 판단 전에 확인해야 할 메모입니다."
            >
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-5">
                <p className="text-sm leading-7 text-slate-700">{auction.description}</p>
              </div>
            </SectionCard>
          ) : null}
        </div>

        <aside className="space-y-4 2xl:sticky 2xl:top-4 2xl:self-start">
          <SectionCard title="즉시 작업" description="현재 상태 기준으로 가능한 작업입니다.">
            <div className="space-y-3">
              {primaryAction.disabled ? (
                <button
                  className="w-full rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500"
                  disabled
                  type="button"
                >
                  {primaryAction.label}
                </button>
              ) : (
                <Link
                  className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white"
                  href={primaryAction.href}
                >
                  {primaryAction.label}
                </Link>
              )}

              <button
                className="w-full rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
                disabled={favoriteMutation.isPending}
                type="button"
                onClick={() => favoriteMutation.mutate(auction.id)}
              >
                {auction.isFavorited ? "♥ 찜한 차에서 해제" : "♡ 찜한 차에 추가"}
              </button>

              <Link
                className="block rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
                href={appRoutes.home()}
              >
                경매장 홈으로 돌아가기
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="상태 요약" description="입찰 전에 꼭 확인할 핵심 값입니다.">
            <div className="space-y-3">
              <SidebarRow label="현재 상태" value={auction.statusLabel} />
              <SidebarRow label="남은 시간" value={remainingTime} />
              <SidebarRow
                label="마감 시각"
                value={formatDateLabel(auction.deadlineAt)}
              />
              <SidebarRow
                label="거래 상태"
                value={auction.dealStage === "none" ? "후속 거래 없음" : auction.dealStage}
              />
            </div>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
};

function SummaryMetric({ label, value }: SummaryMetricProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

type DetailMetricProps = {
  label: string;
  value: string;
};

function DetailMetric({ label, value }: DetailMetricProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

type SidebarRowProps = {
  label: string;
  value: string;
};

function SidebarRow({ label, value }: SidebarRowProps) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}
