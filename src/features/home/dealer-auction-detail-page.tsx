"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealerAuctionDetail } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { getDealerBidDetailQueryKey } from "@/features/bids/lib/dealer-bid-query";
import {
  getDealerAuctionDetailQueryKey,
  useDealerAuctionDetailQuery,
} from "@/features/home/hooks/use-dealer-auction-detail-query";
import { toggleDealerAuctionFavoriteFromApi } from "@/features/home/lib/dealer-home-api";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import { appRoutes } from "@/shared/config/routes";
import { CachedImage } from "@/shared/ui/cached-image";
import { LiveCountdownText } from "@/shared/ui/live-countdown-text";

type DealerAuctionDetailPageProps = {
  auctionId: string;
};

type DetailEntry = {
  label: string;
  value: string | null;
};

const purchaseMethodTone = {
  현금: "bg-emerald-50 text-emerald-700",
  할부: "bg-amber-50 text-amber-700",
  리스: "bg-slate-100 text-slate-600",
  장기렌트: "bg-sky-50 text-sky-700",
} as const;

const statusTone = {
  경매중: "bg-sky-50 text-sky-700",
  "마감 임박": "bg-rose-50 text-rose-700",
  "내 입찰 진행": "bg-violet-50 text-violet-700",
  "계약 진행": "bg-emerald-50 text-emerald-700",
  "경매 종료": "bg-slate-100 text-slate-500",
} as const;

function formatWon(value: number | null | undefined) {
  if (!value) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatAuctionDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatLeaseMileage(value: number | null) {
  if (!value) {
    return "-";
  }

  const manUnit = Math.floor(value / 10_000);
  if (manUnit >= 1 && value % 10_000 === 0) {
    return `${manUnit}만 km`;
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}km`;
}

function formatColorLabel(auction: DealerAuctionDetail) {
  return `${auction.vehicleExteriorColorName ?? "색상 무관"} / ${auction.vehicleInteriorColorName ?? "색상 무관"}`;
}

function buildHeaderMetadata(auction: DealerAuctionDetail) {
  return [auction.yearLabel !== "-" ? auction.yearLabel : null, auction.fuelType !== "-" ? auction.fuelType : null].filter(
    (value): value is string => Boolean(value),
  );
}

function buildConditionEntries(auction: DealerAuctionDetail) {
  if (auction.purchaseMethod === "현금") {
    return filterEntries([
      { label: "공채용 지역", value: auction.userRegion },
      { label: "배송지역", value: auction.deliveryRegion },
      { label: "컬러", value: formatColorLabel(auction) },
      { label: "희망 출고일", value: "협의 필요" },
    ]);
  }

  if (auction.purchaseMethod === "할부") {
    return filterEntries([
      {
        label: "할부 기간",
        value: auction.contractMonths ? `${auction.contractMonths}개월` : null,
      },
      {
        label: "선납금",
        value: formatWon(auction.advanceDownPaymentAmount),
      },
      { label: "공채용 지역", value: auction.userRegion },
      { label: "배송지역", value: auction.deliveryRegion },
    ]);
  }

  return filterEntries([
    {
      label: "이용 기간",
      value: auction.contractMonths ? `${auction.contractMonths}개월` : null,
    },
    {
      label: "선납금",
      value: formatWon(auction.advanceDownPaymentAmount),
    },
    {
      label: "보증금",
      value: formatWon(auction.depositDownPaymentAmount),
    },
    {
      label: "연간 주행거리",
      value: formatLeaseMileage(auction.annualMileage),
    },
    {
      label: "구분",
      value: auction.customerType ?? null,
    },
    { label: "배송지역", value: auction.deliveryRegion },
    { label: "컬러", value: formatColorLabel(auction) },
  ]);
}

function buildAuctionInfoEntries(auction: DealerAuctionDetail) {
  return filterEntries([
    { label: "고객명", value: auction.sellerName },
    { label: "현재 상태", value: auction.statusLabel },
    { label: "마감 시각", value: formatAuctionDate(auction.expireAt) },
    { label: "고객 지역", value: auction.userRegion },
    { label: "배송지역", value: auction.deliveryRegion },
    {
      label: "입찰 / 조회",
      value: `${formatCompactCount(auction.bidCount)}명 / ${formatCompactCount(auction.viewCount)}명`,
    },
  ]);
}

function filterEntries(entries: DetailEntry[]) {
  return entries.filter((entry) => {
    if (!entry.value) {
      return false;
    }

    return entry.value.trim().length > 0 && entry.value.trim() !== "-";
  });
}

function resolvePrimaryAction(auction: DealerAuctionDetail) {
  const isClosed =
    auction.statusCode === "경매 종료" || Date.parse(auction.expireAt) <= Date.now();

  if (auction.myBidSubmissionId) {
    return {
      description: "이미 입찰한 차량입니다. 신청 내역과 현재 순위를 확인할 수 있습니다.",
      disabled: false,
      href: appRoutes.bidDetail(auction.id),
      label: "입찰 완료 (내역 보기)",
    };
  }

  if (isClosed) {
    return {
      description: "이 경매는 마감되어 추가 입찰이 불가능합니다.",
      disabled: true,
      href: "",
      label: "경매 종료",
    };
  }

  return {
    description: "조건을 확인했다면 바로 입찰을 진행할 수 있습니다.",
    disabled: false,
    href: appRoutes.homeAuctionBidWizard(auction.id),
    label: "입찰하기",
  };
}

export function DealerAuctionDetailPage({
  auctionId,
}: DealerAuctionDetailPageProps) {
  const queryClient = useQueryClient();
  const detailQueryKey = getDealerBidDetailQueryKey(auctionId);
  const auctionDetailQueryKey = getDealerAuctionDetailQueryKey(auctionId);
  const auctionDetailQuery = useDealerAuctionDetailQuery(auctionId);
  const favoriteMutation = useMutation({
    mutationFn: toggleDealerAuctionFavoriteFromApi,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: auctionDetailQueryKey });

      const previousDetail = queryClient.getQueryData<DealerAuctionDetail>(auctionDetailQueryKey);
      if (previousDetail) {
        queryClient.setQueryData<DealerAuctionDetail>(auctionDetailQueryKey, {
          ...previousDetail,
          isFavorited: !previousDetail.isFavorited,
        });
      }

      return { previousDetail };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(auctionDetailQueryKey, context.previousDetail);
      }
    },
    onSuccess: (result) => {
      queryClient.setQueryData<DealerAuctionDetail | undefined>(
        auctionDetailQueryKey,
        (current) => (current ? { ...current, isFavorited: result.isFavorited } : current),
      );
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: detailQueryKey });
    },
  });

  if (auctionDetailQuery.isLoading) {
    return (
      <section className="mx-auto max-w-[980px] space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-10 w-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
            <div className="aspect-square animate-pulse bg-slate-100" />
          </div>
          <div className="rounded-[32px] border border-white/80 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
            <div className="space-y-4">
              <div className="h-5 w-56 animate-pulse rounded-full bg-slate-100" />
              <div className="h-9 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-6 w-40 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="h-[220px] animate-pulse rounded-[28px] bg-slate-100" />
        <div className="h-[180px] animate-pulse rounded-[28px] bg-slate-100" />
        <div className="h-[96px] animate-pulse rounded-[28px] bg-slate-100" />
      </section>
    );
  }

  if (auctionDetailQuery.isError || !auctionDetailQuery.data) {
    return (
      <section className="mx-auto max-w-[980px]">
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-5 text-sm text-rose-700">
          경매 상세를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      </section>
    );
  }

  const auction = auctionDetailQuery.data;
  const primaryAction = resolvePrimaryAction(auction);
  const headerMetadata = buildHeaderMetadata(auction);
  const conditionEntries = buildConditionEntries(auction);
  const auctionInfoEntries = buildAuctionInfoEntries(auction);
  const vehicleLabel = `${auction.modelName} ${auction.trimName}`.trim();

  return (
    <section className="mx-auto max-w-[980px] space-y-5 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex min-h-10 items-center rounded-2xl border border-line px-4 text-sm font-medium text-slate-700"
          href={appRoutes.home()}
        >
          경매장 홈
        </Link>
        <button
          className="inline-flex min-h-10 items-center rounded-2xl border border-line px-4 text-sm font-medium text-slate-700"
          disabled={favoriteMutation.isPending}
          type="button"
          onClick={() => favoriteMutation.mutate(auction.id)}
        >
          {auction.isFavorited ? "♥ 찜한 차" : "♡ 찜하기"}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-sm">
          <div className="relative aspect-square bg-slate-100">
            <CachedImage
              alt={`${auction.brandName} ${vehicleLabel}`}
              className="object-contain"
              fallback={
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 text-3xl font-semibold tracking-[0.2em] text-slate-300">
                  CAR
                </div>
              }
              priority
              sizes="(min-width: 1280px) 480px, 100vw"
              src={auction.imageUrl}
            />
          </div>
        </section>

        <section className="rounded-[32px] border border-white/80 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2 font-semibold text-violet-700">
              <span className="h-2 w-2 rounded-full bg-violet-600" />
              <span>남은 시간</span>
              <LiveCountdownText className="tabular-nums" targetAt={auction.expireAt} />
            </span>
            <span className="text-slate-500">
              입찰 {formatCompactCount(auction.bidCount)}명
            </span>
            <span className="text-slate-500">
              조회 {formatCompactCount(auction.viewCount)}명
            </span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-slate-100">
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

          <h1 className="mt-2 text-2xl font-semibold text-slate-950 md:text-[30px]">
            {vehicleLabel}
          </h1>

          {headerMetadata.length > 0 ? (
            <p className="mt-2 text-sm text-slate-600">{headerMetadata.join(" · ")}</p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold ${purchaseMethodTone[auction.purchaseMethod]}`}
            >
              {auction.purchaseMethod}
            </span>
            <p className="text-2xl font-semibold text-violet-700 md:text-[28px]">
              {auction.askingPriceLabel}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[auction.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
            >
              {auction.statusLabel}
            </span>
          </div>
        </section>
      </div>

      <DetailSection title={`${auction.purchaseMethod} 조건`}>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {conditionEntries.map((entry) => (
            <DetailField key={entry.label} label={entry.label} value={entry.value ?? "-"} />
          ))}
        </div>

        {auction.myBidSubmissionId ? (
          <div className="mt-6 flex justify-end">
            <Link
              className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline"
              href={appRoutes.bidDetail(auction.id)}
            >
              신청내역 상세보기
            </Link>
          </div>
        ) : null}
      </DetailSection>

      <DetailSection title="경매 정보">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {auctionInfoEntries.map((entry) => (
            <DetailField key={entry.label} label={entry.label} value={entry.value ?? "-"} />
          ))}
        </div>
      </DetailSection>

      {auction.description ? (
        <DetailSection title="고객 요청 메모">
          <div className="rounded-[24px] bg-slate-50 px-4 py-4">
            <p className="text-sm leading-7 text-slate-700">{auction.description}</p>
          </div>
        </DetailSection>
      ) : null}

      <div className="sticky bottom-0 z-20 rounded-[28px] border border-violet-100 bg-white/98 p-4 shadow-[0_-20px_40px_rgba(91,33,182,0.14)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">{primaryAction.label}</p>
            <p className="mt-1 text-xs text-slate-500">{primaryAction.description}</p>
          </div>

          {primaryAction.disabled ? (
            <button
              className="min-h-12 rounded-2xl bg-slate-200 px-5 text-sm font-semibold text-slate-500"
              disabled
              type="button"
            >
              {primaryAction.label}
            </button>
          ) : (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-violet-700 px-6 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(91,33,182,0.28)] transition hover:bg-violet-800"
              href={primaryAction.href}
            >
              {primaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

type DetailSectionProps = {
  children: React.ReactNode;
  title: string;
};

function DetailSection({ children, title }: DetailSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
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
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
