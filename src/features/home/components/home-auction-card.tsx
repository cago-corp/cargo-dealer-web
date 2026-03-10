import Link from "next/link";
import type { DealerAuctionBrief } from "@/entities/auction/schemas/dealer-auction-brief-schema";
import { appRoutes } from "@/shared/config/routes";

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
      label: "내 입찰 보기",
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
    label: "경매 상세 보기",
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

  return (
    <article className="rounded-[24px] border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
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
          <h3 className="mt-2 truncate text-lg font-semibold text-slate-950">
            {vehicleLabel}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
            >
              {item.purchaseMethod}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
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

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Metric label="희망 금액" value={item.askingPriceLabel} />
        <Metric label="마감 시각" value={formatDeadlineLabel(item.deadlineAt)} />
        <Metric label="연식" value={item.yearLabel} />
        <Metric label="주행거리" value={item.mileageLabel} />
        <Metric
          label="입찰 수"
          value={`${item.bidCount.toLocaleString("ko-KR")}명`}
        />
        <Metric
          label="조회 수"
          value={`${item.viewCount.toLocaleString("ko-KR")}회`}
        />
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        {primaryAction.href ? (
          <Link
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
        ) : (
          <button
            className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500"
            disabled
            type="button"
          >
            {primaryAction.label}
          </button>
        )}
        <Link
          className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
          href={appRoutes.homeAuctionDetail(item.id)}
        >
          상세 정보
        </Link>
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
