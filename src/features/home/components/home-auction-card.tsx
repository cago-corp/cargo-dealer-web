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
  장기렌트: "bg-sky-50 text-sky-700",
} as const;

function getPrimaryAction(item: DealerAuctionBrief) {
  if (item.bidState === "my_bid") {
    return {
      href: appRoutes.bidDetail(item.id),
      tone: "accent",
      label: "내 입찰",
    };
  }

  if (item.bidState === "closed") {
    return {
      href: appRoutes.homeAuctionDetail(item.id),
      tone: "neutral",
      label: "상세",
    };
  }

  return {
    href: appRoutes.homeAuctionDetail(item.id),
    tone: "neutral",
    label: "상세",
  };
}

export function HomeAuctionCard({
  item,
  isFavoritePending,
  onFavoriteToggle,
}: HomeAuctionCardProps) {
  const primaryAction = getPrimaryAction(item);
  const vehicleLabel = `${item.brandName} ${item.modelName}`;
  const remainingTime = formatRemainingTime(item.expireAt);
  const countLabel = `입찰 ${item.bidCount.toLocaleString("ko-KR")}명 · 조회 ${item.viewCount.toLocaleString("ko-KR")}회`;

  return (
    <article className="rounded-[20px] border border-line bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] sm:rounded-[24px] sm:py-4 sm:shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="max-w-[82px] truncate text-[13px] font-medium text-slate-500 sm:max-w-[120px] sm:text-sm">
              {item.sellerName}
            </p>
            <h3 className="min-w-0 truncate text-[15px] font-semibold text-slate-950 sm:text-[17px]">
              {vehicleLabel}
            </h3>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:mt-2">
            <span
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${purchaseMethodTone[item.purchaseMethod]}`}
            >
              {item.purchaseMethod}
            </span>
            <span className="whitespace-nowrap text-[13px] text-slate-500 sm:text-sm">
              • {item.regionLabel}
            </span>
          </div>

          <div className="mt-1.5 flex flex-col gap-0.5 text-[13px] text-slate-500 sm:mt-2 sm:gap-1 sm:text-sm lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <span className="whitespace-nowrap">{remainingTime}</span>
            <span className="hidden text-slate-300 lg:inline">|</span>
            <span className="whitespace-nowrap">{countLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2.5 self-stretch sm:gap-3">
          <FavoriteButton
            disabled={isFavoritePending}
            isFavorited={item.isFavorited}
            onClick={() => onFavoriteToggle(item.id)}
          />
          <Link
            aria-label={primaryAction.label}
            className={
              primaryAction.tone === "accent"
                ? "inline-flex min-h-9 items-center justify-center rounded-full bg-violet-700 px-3.5 text-[13px] font-semibold text-white transition hover:bg-violet-800 sm:min-h-10 sm:px-4 sm:text-sm"
                : "inline-flex min-h-9 items-center justify-center rounded-full border border-line bg-white px-3.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:min-h-10 sm:px-4 sm:text-sm"
            }
            href={primaryAction.href}
            title={primaryAction.label}
          >
            {primaryAction.label === "상세" ? "상세보기" : primaryAction.label}
          </Link>
        </div>
      </div>
    </article>
  );
}

type FavoriteButtonProps = {
  disabled: boolean;
  isFavorited: boolean;
  onClick: () => void;
};

function FavoriteButton({
  disabled,
  isFavorited,
  onClick,
}: FavoriteButtonProps) {
  return (
    <button
      aria-label={isFavorited ? "찜 해제" : "찜하기"}
      className={
        isFavorited
          ? "inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-sm font-medium text-rose-600 transition hover:bg-rose-100 sm:h-10 sm:w-10"
          : "inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium text-slate-500 transition hover:bg-slate-100 sm:h-10 sm:w-10"
      }
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {isFavorited ? "♥" : "♡"}
    </button>
  );
}
