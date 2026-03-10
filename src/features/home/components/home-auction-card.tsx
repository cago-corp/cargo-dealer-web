import Link from "next/link";
import type { DealerAuctionBrief } from "@/entities/auction/schemas/dealer-auction-brief-schema";
import { appRoutes } from "@/shared/config/routes";
import { formatRemainingTime } from "@/shared/lib/format/format-remaining-time";

type HomeAuctionCardProps = {
  item: DealerAuctionBrief;
  isFavoritePending: boolean;
  onFavoriteToggle: (auctionId: string) => void;
};

const purchaseMethodTone = {
  현금: "bg-emerald-50 text-emerald-700",
  할부: "bg-amber-50 text-amber-700",
  리스: "bg-slate-100 text-slate-600",
} as const;

const statusTone = {
  경매중: "bg-sky-50 text-sky-700",
  "마감 임박": "bg-rose-50 text-rose-700",
  "내 입찰 진행": "bg-violet-50 text-violet-700",
  "계약 진행": "bg-emerald-50 text-emerald-700",
  "경매 종료": "bg-slate-200 text-slate-600",
} as const;

function formatDeadlineLabel(deadlineAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(deadlineAt));
}

function getPrimaryAction(item: DealerAuctionBrief) {
  if (item.bidState === "my_bid") {
    return {
      href: appRoutes.bidDetail(item.id),
      label: "내 입찰",
    };
  }

  if (item.bidState === "closed") {
    return {
      href: null,
      label: "경매 종료",
    };
  }

  return {
    href: appRoutes.homeAuctionDetail(item.id),
    label: "상세 보기",
  };
}

export function HomeAuctionCard({
  item,
  isFavoritePending,
  onFavoriteToggle,
}: HomeAuctionCardProps) {
  const primaryAction = getPrimaryAction(item);
  const vehicleLabel = `${item.brandName} ${item.modelName} ${item.trimName}`;
  const marketLabel = item.isImported ? "수입차" : "국산차";
  const remainingTime = formatRemainingTime(item.deadlineAt);

  return (
    <article className="rounded-[22px] border border-line bg-white px-4 py-4">
      <div className="xl:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-500">{item.sellerName}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[item.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
              >
                {item.statusLabel}
              </span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-950">
              {vehicleLabel}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span
                className={`rounded-lg px-2.5 py-1 font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
              >
                {item.purchaseMethod}
              </span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                {marketLabel}
              </span>
              <span>{item.regionLabel}</span>
            </div>
          </div>
          <button
            aria-label={item.isFavorited ? "찜 해제" : "찜하기"}
            className="rounded-full bg-slate-100 px-3 py-2 text-base text-slate-500"
            disabled={isFavoritePending}
            type="button"
            onClick={() => onFavoriteToggle(item.id)}
          >
            {item.isFavorited ? "♥" : "♡"}
          </button>
        </div>

        <div className="mt-4 grid gap-2 grid-cols-2">
          <Metric label="희망 금액" value={item.askingPriceLabel} />
          <Metric label="남은 시간" value={remainingTime} />
          <Metric label="마감 시각" value={formatDeadlineLabel(item.deadlineAt)} />
          <Metric label="연식 / 주행거리" value={`${item.yearLabel} · ${item.mileageLabel}`} />
          <Metric
            label="입찰 / 조회"
            value={`${item.bidCount.toLocaleString("ko-KR")}명 / ${item.viewCount.toLocaleString("ko-KR")}회`}
          />
          <Metric
            label="거래 상태"
            value={item.dealStage === "none" ? "-" : item.dealStage}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {primaryAction.href ? (
            <Link
              className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white"
              href={primaryAction.href}
            >
              {primaryAction.label}
            </Link>
          ) : (
            <button
              className="rounded-2xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"
              disabled
              type="button"
            >
              {primaryAction.label}
            </button>
          )}
          <Link
            className="rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-slate-700"
            href={appRoutes.homeAuctionDetail(item.id)}
          >
            상세
          </Link>
        </div>
      </div>

      <div className="hidden xl:grid xl:grid-cols-[minmax(0,2.3fr)_minmax(180px,1fr)_minmax(170px,0.9fr)_minmax(180px,1fr)_minmax(160px,0.9fr)_auto] xl:items-center xl:gap-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-500">{item.sellerName}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[item.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {item.statusLabel}
                </span>
                {item.dealStage !== "none" ? (
                  <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                    {item.dealStage}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-2 truncate text-base font-semibold text-slate-950">
                {vehicleLabel}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span
                  className={`rounded-lg px-2.5 py-1 font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
                >
                  {item.purchaseMethod}
                </span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                  {marketLabel}
                </span>
                <span>{item.regionLabel}</span>
              </div>
            </div>
            <button
              aria-label={item.isFavorited ? "찜 해제" : "찜하기"}
              className="rounded-full bg-slate-100 px-3 py-2 text-base text-slate-500"
              disabled={isFavoritePending}
              type="button"
              onClick={() => onFavoriteToggle(item.id)}
            >
              {item.isFavorited ? "♥" : "♡"}
            </button>
          </div>
        </div>

        <InfoStack
          label="조건"
          primary={item.askingPriceLabel}
          secondary={`${item.purchaseMethod} · ${item.regionLabel}`}
        />
        <InfoStack
          label="차량 정보"
          primary={item.yearLabel}
          secondary={item.mileageLabel}
        />
        <InfoStack
          label="현황"
          primary={`남은 ${remainingTime}`}
          secondary={`입찰 ${item.bidCount.toLocaleString("ko-KR")}명 · 조회 ${item.viewCount.toLocaleString("ko-KR")}회`}
        />
        <InfoStack
          label="마감 시각"
          primary={formatDeadlineLabel(item.deadlineAt)}
          secondary={item.dealStage === "none" ? "후속 거래 없음" : item.dealStage}
        />

        <div className="flex flex-col gap-2">
          {primaryAction.href ? (
            <Link
              className="rounded-2xl bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white"
              href={primaryAction.href}
            >
              {primaryAction.label}
            </Link>
          ) : (
            <button
              className="rounded-2xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"
              disabled
              type="button"
            >
              {primaryAction.label}
            </button>
          )}
          <Link
            className="rounded-2xl border border-line px-4 py-2.5 text-center text-sm font-medium text-slate-700"
            href={appRoutes.homeAuctionDetail(item.id)}
          >
            상세
          </Link>
        </div>
      </div>
    </article>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

type InfoStackProps = {
  label: string;
  primary: string;
  secondary: string;
};

function InfoStack({
  label,
  primary,
  secondary,
}: InfoStackProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{primary}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{secondary}</p>
    </div>
  );
}
