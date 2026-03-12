"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDealerBidDetailQueryKey,
  getDealerBidRankQueryKey,
} from "@/features/bids/lib/dealer-bid-query";
import { useDealerBidDetailQuery } from "@/features/bids/hooks/use-dealer-bid-detail-query";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import { dealerAuctionDetailQueryRoot } from "@/features/home/hooks/use-dealer-auction-detail-query";
import { fetchDealerBidRank } from "@/features/bids/lib/dealer-bid-query";
import { toggleDealerAuctionFavoriteFromApi } from "@/features/home/lib/dealer-home-api";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { CachedImage } from "@/shared/ui/cached-image";
import { SectionCard } from "@/shared/ui/section-card";

type DealerBidDetailPageProps = {
  auctionId: string;
};

const purchaseMethodTone = {
  현금: "bg-emerald-50 text-emerald-700",
  할부: "bg-amber-50 text-amber-700",
  리스: "bg-slate-100 text-slate-600",
  장기렌트: "bg-sky-50 text-sky-700",
} as const;

const submissionStateLabel = {
  bidding: "입찰 진행",
  contract_pending: "계약 입력 대기",
  completed: "거래 완료",
  closed: "종료",
} as const;

function formatWon(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DealerBidDetailPage({
  auctionId,
}: DealerBidDetailPageProps) {
  const queryClient = useQueryClient();
  const bidDetailQuery = useDealerBidDetailQuery(auctionId);
  const bidRankQuery = useQuery({
    queryKey: getDealerBidRankQueryKey(auctionId),
    queryFn: () => fetchDealerBidRank(auctionId),
    enabled: false,
  });

  const favoriteMutation = useMutation({
    mutationFn: toggleDealerAuctionFavoriteFromApi,
    onSuccess: (result) => {
      queryClient.setQueryData(getDealerBidDetailQueryKey(auctionId), (currentData: typeof bidDetailQuery.data) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          auction: {
            ...currentData.auction,
            isFavorited: result.isFavorited,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: dealerAuctionDetailQueryRoot });
    },
  });

  if (bidDetailQuery.isLoading) {
    return (
      <SectionCard title="내 입찰 상세" description="입찰 상세를 불러오는 중입니다.">
        <div className="h-[320px] animate-pulse rounded-[28px] bg-slate-100" />
      </SectionCard>
    );
  }

  if (bidDetailQuery.isError || !bidDetailQuery.data) {
    return (
      <SectionCard title="내 입찰 상세" description="입찰 상세를 불러오지 못했습니다.">
        <p className="text-sm text-rose-600">잠시 후 다시 시도해 주세요.</p>
      </SectionCard>
    );
  }

  const { auction, submission, totalBidders } = bidDetailQuery.data;
  const imageUrl = auction.imageUrl;
  const primaryPriceLabel =
    submission.purchaseMethod === "현금" ? "할인금액" : "월 납입료";
  const primaryPriceValue =
    submission.purchaseMethod === "현금"
      ? formatWon(submission.discountAmountValue)
      : formatWon(submission.monthlyPaymentValue);
  const conditionRows = [
    {
      label: submission.purchaseMethod === "현금" ? "공채용 지역" : "기간",
      value:
        submission.purchaseMethod === "현금"
          ? auction.userRegion
          : auction.contractMonths
            ? `${auction.contractMonths}개월`
            : "-",
    },
    {
      label: submission.purchaseMethod === "현금" ? "배송지역" : "선납금",
      value:
        submission.purchaseMethod === "현금"
          ? auction.deliveryRegion
          : formatWon(auction.advanceDownPaymentAmount),
    },
    {
      label: submission.purchaseMethod === "현금" ? "컬러" : "보증금",
      value:
        submission.purchaseMethod === "현금"
          ? `${auction.vehicleExteriorColorName ?? "색상 무관"} / ${auction.vehicleInteriorColorName ?? "색상 무관"}`
          : formatWon(auction.depositDownPaymentAmount),
    },
    {
      label: submission.purchaseMethod === "현금" ? "희망 출고일" : "연간 주행거리",
      value:
        submission.purchaseMethod === "현금"
          ? "협의 필요"
          : auction.annualMileage
            ? `${new Intl.NumberFormat("ko-KR").format(auction.annualMileage)} km`
            : "-",
    },
    {
      label: submission.purchaseMethod === "현금" ? "연식" : "구분",
      value:
        submission.purchaseMethod === "현금"
          ? auction.yearLabel
          : auction.customerType ?? "-",
    },
    {
      label: submission.purchaseMethod === "현금" ? "연료" : "컬러",
      value:
        submission.purchaseMethod === "현금"
          ? auction.fuelType
          : `${auction.vehicleExteriorColorName ?? "색상 무관"} / ${auction.vehicleInteriorColorName ?? "색상 무관"}`,
    },
  ];

  return (
    <section className="mx-auto max-w-[960px] space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
        <div className="relative h-[220px] bg-slate-100">
          <CachedImage
            alt={`${auction.brandName} ${auction.modelName}`}
            className="object-cover"
            fallback={
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 text-3xl font-semibold tracking-[0.2em] text-slate-300">
                CAR
              </div>
            }
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            src={imageUrl}
          />

          <button
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-lg text-slate-700 shadow-sm"
            disabled={favoriteMutation.isPending}
            type="button"
            onClick={() => favoriteMutation.mutate(auction.id)}
          >
            {auction.isFavorited ? "♥" : "♡"}
          </button>

          {bidRankQuery.data ? (
            <div className="absolute bottom-5 right-5 rounded-full bg-black/75 px-3 py-1.5 text-sm font-semibold text-white">
              현재 {bidRankQuery.data.myRank}위 / {bidRankQuery.data.totalBids}명
            </div>
          ) : null}
        </div>

        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <span className="text-slate-500">남은 시간</span>
                  <span className="text-violet-700">{formatRemainingTime(auction.deadlineAt)}</span>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {auction.bidCount}명 입찰
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {submissionStateLabel[submission.state]}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500">
                  {auction.brandName.slice(0, 1)}
                </span>
                <span>{auction.brandName}</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                {auction.modelName} {auction.trimName}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {auction.yearLabel} · {auction.fuelType} · {auction.userRegion}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-3 rounded-full bg-slate-100" />

      <div className="rounded-[32px] border border-white/80 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">{primaryPriceLabel}</span>
          <span className="text-2xl font-semibold text-slate-950">{primaryPriceValue}</span>
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[submission.purchaseMethod]}`}
          >
            {submission.purchaseMethod}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-500">차량가</span>
            <span>{auction.askingPriceLabel}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-xs text-slate-500">
              ₩
            </span>
            <span>{submission.capitalName ?? "-"}</span>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-950">
            {submission.purchaseMethod} 조건
          </h2>
          <div className="mt-5 grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
            {conditionRows.map((row) => (
              <ConditionItem key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-slate-50 px-5 py-5">
          <p className="text-base font-semibold text-slate-950">출고서비스</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {submission.services.length === 0
              ? "없음"
              : submission.services.map((service) => `• ${service.name}`).join("  ")}
          </p>
          {submission.note ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-sm font-medium text-slate-700">요청사항</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{submission.note}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-x-6 gap-y-5 md:grid-cols-2">
          <ConditionItem label="입찰 시각" value={formatCompactDate(submission.submittedAt)} />
          <ConditionItem
            label="현재 상태"
            value={submissionStateLabel[submission.state]}
          />
        </div>
      </div>

      <div className="sticky bottom-4 z-10 rounded-[24px] border border-white/80 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white"
          disabled={bidRankQuery.isFetching}
          type="button"
          onClick={() => {
            bidRankQuery.refetch();
          }}
        >
          {bidRankQuery.isFetching ? "순위 확인 중..." : "입찰순위 확인"}
        </button>
      </div>
    </section>
  );
}

type ConditionItemProps = {
  label: string;
  value: string;
};

function ConditionItem({ label, value }: ConditionItemProps) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
