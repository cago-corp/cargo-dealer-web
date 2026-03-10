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

  return (
    <article className="rounded-[28px] border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{item.sellerName}</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            {item.brandName} {item.modelName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{item.trimName}</p>
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
        >
          {item.purchaseMethod}
        </span>
        <span className="text-sm text-slate-500">📍 {item.regionLabel}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {item.statusLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="연식" value={item.yearLabel} />
        <Metric label="주행거리" value={item.mileageLabel} />
        <Metric label="희망 금액" value={item.askingPriceLabel} />
        <Metric label="마감 시각" value={formatDeadlineLabel(item.deadlineAt)} />
      </dl>

      {item.dealStage !== "none" ? (
        <div className="mt-4 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
          거래 후속 상태: <strong>{item.dealStage}</strong>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
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
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
