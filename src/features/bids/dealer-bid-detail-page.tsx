"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDealerBidRankQueryKey } from "@/features/bids/lib/dealer-bid-query";
import { useDealerBidDetailQuery } from "@/features/bids/hooks/use-dealer-bid-detail-query";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import {
  dealerAuctionDetailQueryRoot,
} from "@/features/home/hooks/use-dealer-auction-detail-query";
import {
  fetchDealerBidRank,
  toggleDealerAuctionFavorite,
} from "@/shared/api/dealer-marketplace";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";
import { SectionCard } from "@/shared/ui/section-card";

type DealerBidDetailPageProps = {
  auctionId: string;
};

function formatWon(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
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
    mutationFn: toggleDealerAuctionFavorite,
    onSuccess: () => {
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

  return (
    <section className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
        <div className="aspect-[16/8] bg-gradient-to-br from-slate-100 via-white to-teal-50" />
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{auction.brandName}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                {auction.modelName} {auction.trimName}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                {auction.yearLabel} · {auction.fuelType} · {auction.userRegion}
              </p>
            </div>
            <button
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
              현재 상태 {submission.state === "contract_pending" ? "계약 입력 대기" : "입찰 진행"}
            </span>
            {bidRankQuery.data ? (
              <span className="rounded-full bg-slate-950 px-3 py-1 text-white">
                현재 {bidRankQuery.data}위 / {totalBidders}명
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionCard
            title="내 제안 조건"
            description="Flutter my bid detail의 제출 폼 요약을 web 2단 정보판으로 옮겼습니다."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailMetric label="구매 방식" value={submission.purchaseMethod} />
              <DetailMetric label="차량가" value={auction.askingPriceLabel} />
              <DetailMetric
                label="월 납입료"
                value={formatWon(submission.monthlyPaymentValue)}
              />
              <DetailMetric
                label="할인 금액"
                value={formatWon(submission.discountAmountValue)}
              />
              <DetailMetric label="캐피탈" value={submission.capitalName ?? "-"} />
              <DetailMetric
                label="입찰 시각"
                value={new Intl.DateTimeFormat("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).format(new Date(submission.submittedAt))}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={`${submission.purchaseMethod} 조건`}
            description="경매 상세와 동일한 조건 필드를 유지하면서 내 제안값과 함께 봅니다."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailMetric label="배송지역" value={auction.deliveryRegion} />
              <DetailMetric label="공채용 지역" value={auction.userRegion} />
              <DetailMetric
                label="연식 / 연료"
                value={`${auction.yearLabel} · ${auction.fuelType}`}
              />
              <DetailMetric label="주행거리" value={auction.mileageLabel} />
              <DetailMetric
                label="거래 후속 상태"
                value={auction.dealStage === "none" ? "없음" : auction.dealStage}
              />
              <DetailMetric
                label="컬러"
                value={`${auction.vehicleExteriorColorName ?? "무관"} / ${auction.vehicleInteriorColorName ?? "무관"}`}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="출고 서비스"
            description="모바일 상세의 출고 서비스 박스를 그대로 유지합니다."
          >
            <div className="space-y-3 rounded-3xl bg-slate-50 p-5">
              {submission.services.length === 0 ? (
                <p className="text-sm text-slate-500">선택한 서비스가 없습니다.</p>
              ) : (
                submission.services.map((service) => (
                  <div key={service.id}>
                    <p className="text-sm font-semibold text-slate-950">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {service.description}
                    </p>
                  </div>
                ))
              )}
              <div className="border-t border-slate-200 pt-3">
                <p className="text-sm font-semibold text-slate-950">메모</p>
                <p className="mt-1 text-sm text-slate-500">
                  {submission.note || "별도 메모 없음"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="랭킹 확인"
            description="Flutter 하단 CTA를 우측 고정 액션 패널로 바꿨습니다."
          >
            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
              disabled={bidRankQuery.isFetching}
              type="button"
              onClick={() => {
                bidRankQuery.refetch();
              }}
            >
              {bidRankQuery.isFetching ? "순위 확인 중..." : "입찰순위 확인"}
            </button>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              현재 입찰자 수 {auction.bidCount}명
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
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
