"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealerAuctionDetail } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { getDealerBidDetailQueryKey } from "@/features/bids/lib/dealer-bid-query";
import {
  dealerAuctionWorkspaceQueryRoot,
} from "@/features/home/lib/dealer-auction-workspace-query";
import {
  dealerAuctionDetailQueryRoot,
  useDealerAuctionDetailQuery,
} from "@/features/home/hooks/use-dealer-auction-detail-query";
import { toggleDealerAuctionFavorite } from "@/shared/api/dealer-marketplace";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { SectionCard } from "@/shared/ui/section-card";

type DealerAuctionDetailPageProps = {
  auctionId: string;
};

function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function buildConditionEntries(auction: DealerAuctionDetail) {
  if (auction.purchaseMethod === "현금") {
    return [
      { label: "공채용 지역", value: auction.userRegion },
      { label: "배송지역", value: auction.deliveryRegion },
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
      { label: "배송지역", value: auction.deliveryRegion },
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
    { label: "구분", value: auction.customerType ?? "-" },
    { label: "배송지역", value: auction.deliveryRegion },
  ];
}

function resolvePrimaryAction(auction: DealerAuctionDetail) {
  if (auction.myBidSubmissionId) {
    return {
      href: appRoutes.bidDetail(auction.id),
      label: "입찰 완료 (내역 보기)",
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
    mutationFn: toggleDealerAuctionFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: dealerAuctionDetailQueryRoot });
      queryClient.invalidateQueries({ queryKey: getDealerBidDetailQueryKey(auctionId) });
    },
  });

  if (auctionDetailQuery.isLoading) {
    return (
      <SectionCard title="경매 상세" description="상세 정보를 불러오는 중입니다.">
        <div className="h-[320px] animate-pulse rounded-[28px] bg-slate-100" />
      </SectionCard>
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

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-100 via-white to-teal-50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.16),transparent_28%)]" />
              <div className="absolute inset-x-8 bottom-8 rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-lg backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {auction.brandName}
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                      {auction.modelName} {auction.trimName}
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                      {auction.yearLabel} · {auction.fuelType} · {auction.regionLabel}
                    </p>
                  </div>
                  <button
                    aria-label={auction.isFavorited ? "찜 해제" : "찜하기"}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600"
                    disabled={favoriteMutation.isPending}
                    type="button"
                    onClick={() => favoriteMutation.mutate(auction.id)}
                  >
                    {auction.isFavorited ? "♥ 찜한 차" : "♡ 찜하기"}
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-teal-50 px-3 py-1 font-semibold text-teal-700">
                    남은 시간 {formatRemainingTime(auction.deadlineAt)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {auction.bidCount}명 입찰
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {auction.viewCount}명 조회
                  </span>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-white">
                    {auction.askingPriceLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <SectionCard
            title={`${auction.purchaseMethod} 조건`}
            description="고객이 요청한 주요 조건을 한눈에 확인할 수 있습니다."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {conditionEntries.map((entry) => (
                <div
                  className="rounded-2xl bg-slate-50 px-4 py-4"
                  key={entry.label}
                >
                  <p className="text-sm text-slate-500">{entry.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">
                    {entry.value}
                  </p>
                </div>
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

          <SectionCard
            title="차량 및 경매 메모"
            description="고객 요청사항과 현재 경매 상황을 함께 확인하세요."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <DetailMetric label="희망 금액" value={auction.askingPriceLabel} />
              <DetailMetric label="마감 시각" value={formatDateLabel(auction.deadlineAt)} />
              <DetailMetric label="주행거리" value={auction.mileageLabel} />
              <DetailMetric label="거래 후속 상태" value={auction.dealStage === "none" ? "없음" : auction.dealStage} />
            </div>
            <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
              {auction.description}
            </p>
          </SectionCard>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="다음 액션"
            description="지금 가능한 다음 작업을 바로 진행할 수 있습니다."
          >
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
              <Link
                className="block rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
                href={appRoutes.home()}
              >
                경매장 홈으로 돌아가기
              </Link>
            </div>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              현재 상태: <strong className="text-slate-950">{auction.statusLabel}</strong>
            </p>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

type DetailMetricProps = {
  label: string;
  value: string;
};

function DetailMetric({ label, value }: DetailMetricProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
