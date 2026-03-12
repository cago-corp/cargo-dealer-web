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
import { CachedImage } from "@/shared/ui/cached-image";
import { LiveCountdownText } from "@/shared/ui/live-countdown-text";
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
  const colorMetadata = [
    auction.vehicleExteriorColorName ?? null,
    auction.vehicleInteriorColorName ?? null,
  ].filter(Boolean);
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
      label: submission.purchaseMethod === "현금" ? "연료" : "보증금",
      value:
        submission.purchaseMethod === "현금"
          ? auction.fuelType
          : formatWon(auction.depositDownPaymentAmount),
    },
  ];
  const auctionInfoRows = [
    { label: "입찰 시각", value: formatCompactDate(submission.submittedAt) },
    { label: "현재 상태", value: submissionStateLabel[submission.state] },
    { label: "입찰 수", value: `${auction.bidCount}명` },
    {
      label: "현재 순위",
      value: submission.currentRank ? `${submission.currentRank}위` : "-",
    },
  ];

  return (
    <section className="mx-auto max-w-[960px] space-y-4 sm:space-y-6">
      <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-sm sm:rounded-[32px]">
        <div className="relative h-[190px] bg-white sm:h-[220px]">
          <CachedImage
            alt={`${auction.brandName} ${auction.modelName}`}
            className="object-contain"
            fallback={
              <div className="flex h-full items-center justify-center bg-white text-3xl font-semibold tracking-[0.2em] text-slate-300">
                CAR
              </div>
            }
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            src={imageUrl}
          />

          <button
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-lg text-slate-700 shadow-sm sm:right-5 sm:top-5 sm:h-11 sm:w-11"
            disabled={favoriteMutation.isPending}
            type="button"
            onClick={() => favoriteMutation.mutate(auction.id)}
          >
            {auction.isFavorited ? "♥" : "♡"}
          </button>

          {bidRankQuery.data ? (
            <div className="absolute bottom-4 right-4 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white sm:bottom-5 sm:right-5 sm:text-sm">
              현재 {bidRankQuery.data.myRank}위 / {bidRankQuery.data.totalBids}명
            </div>
          ) : null}
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 sm:gap-2 sm:text-sm">
                  <span className="text-slate-500">남은 시간</span>
                  <LiveCountdownText
                    className="tabular-nums text-violet-700"
                    targetAt={auction.expireAt}
                  />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 sm:px-3 sm:py-1 sm:text-xs">
                  {auction.bidCount}명 입찰
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 sm:px-3 sm:py-1 sm:text-xs">
                  {submissionStateLabel[submission.state]}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 sm:mt-5 sm:text-sm">
                <div className="relative h-5 w-5 overflow-hidden rounded-full bg-slate-100 sm:h-6 sm:w-6">
                  <CachedImage
                    alt={auction.brandName}
                    className="object-cover"
                    fallback={
                      <div className="flex h-full items-center justify-center text-[10px] font-semibold text-slate-400">
                        {auction.brandName.slice(0, 1)}
                      </div>
                    }
                    sizes="24px"
                    src={auction.brandLogoImageUrl}
                  />
                </div>
                <span>{auction.brandName}</span>
              </div>
              <h1 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                {auction.modelName} {auction.trimName}
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 sm:mt-2">
                {auction.yearLabel} · {auction.fuelType} · {auction.userRegion}
              </p>
              {colorMetadata.length > 0 ? (
                <p className="mt-1 text-sm text-slate-600 sm:mt-1.5">
                  {colorMetadata.join(" · ")}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-slate-100 sm:h-3" />

      <div className="rounded-[24px] border border-white/80 bg-white px-4 py-4 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 sm:text-sm">{primaryPriceLabel}</span>
          <span className="text-xl font-semibold text-slate-950 sm:text-2xl">{primaryPriceValue}</span>
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:py-1 sm:text-xs ${purchaseMethodTone[submission.purchaseMethod]}`}
          >
            {submission.purchaseMethod}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-700 sm:mt-4">
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

        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">
            {submission.purchaseMethod} 조건
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:mt-5 md:grid-cols-3 md:gap-x-6 md:gap-y-4 xl:grid-cols-4">
            {conditionRows.map((row) => (
              <ConditionItem key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">경매 정보</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:mt-5 md:grid-cols-3 md:gap-x-6 md:gap-y-4 xl:grid-cols-4">
            {auctionInfoRows.map((row) => (
              <ConditionItem key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[20px] bg-slate-50 px-4 py-4 sm:mt-8 sm:rounded-[24px] sm:px-5 sm:py-5">
          <p className="text-base font-semibold text-slate-950">출고서비스</p>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:leading-7">
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

      </div>

      <div className="sticky bottom-3 z-10 rounded-[20px] border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur sm:bottom-4 sm:rounded-[24px] sm:p-4">
        <button
          className="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white sm:py-4 sm:text-base"
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
      <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-5 text-slate-950 sm:mt-1.5 sm:text-base">
        {value}
      </p>
    </div>
  );
}
