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
      label: "내 입찰",
    };
  }

  if (item.bidState === "closed") {
    return {
      href: appRoutes.homeAuctionDetail(item.id),
      label: "상세",
    };
  }

  return {
    href: appRoutes.homeAuctionDetail(item.id),
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
    <article className="rounded-[24px] border border-line bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="max-w-[96px] truncate text-sm font-medium text-slate-500 md:max-w-[120px]">
              {item.sellerName}
            </p>
            <h3 className="min-w-0 truncate text-base font-semibold text-slate-950 md:text-[17px]">
              {vehicleLabel}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
            >
              {item.purchaseMethod}
            </span>
            <span className="whitespace-nowrap text-slate-500">• {item.regionLabel}</span>
          </div>

          <div className="mt-2 flex flex-col gap-1 text-sm text-slate-500 lg:flex-row lg:flex-wrap lg:items-center lg:gap-3">
            <span className="whitespace-nowrap">{remainingTime}</span>
            <span className="hidden text-slate-300 lg:inline">|</span>
            <span className="whitespace-nowrap">{countLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-3 self-stretch">
          <FavoriteButton
            disabled={isFavoritePending}
            isFavorited={item.isFavorited}
            onClick={() => onFavoriteToggle(item.id)}
          />
          <Link
            className="inline-flex min-h-10 items-center px-1 text-sm font-semibold text-slate-700 underline underline-offset-4"
            href={primaryAction.href}
          >
            {primaryAction.label}
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-600"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {isFavorited ? "♥" : "♡"}
    </button>
  );
}
