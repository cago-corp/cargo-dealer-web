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
    <article className="rounded-[24px] border border-line bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="2xl:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-medium text-slate-500">
                {item.sellerName}
              </p>
              <span
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[item.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
              >
                {item.statusLabel}
              </span>
              {item.dealStage !== "none" ? (
                <span className="whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                  {item.dealStage}
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-950">
              {vehicleLabel}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
              >
                {item.purchaseMethod}
              </span>
              <span className="whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                {marketLabel}
              </span>
              <span className="whitespace-nowrap">{item.regionLabel}</span>
            </div>
          </div>
          <FavoriteButton
            disabled={isFavoritePending}
            isFavorited={item.isFavorited}
            onClick={() => onFavoriteToggle(item.id)}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Metric label="희망 금액" value={item.askingPriceLabel} />
          <Metric label="남은 시간" value={remainingTime} />
          <Metric label="마감 시각" value={formatDeadlineLabel(item.deadlineAt)} />
          <Metric
            label="연식 / 주행거리"
            value={`${item.yearLabel} · ${item.mileageLabel}`}
          />
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
          <PrimaryActionButton action={primaryAction} />
          <SecondaryActionButton href={appRoutes.homeAuctionDetail(item.id)} />
        </div>
      </div>

      <div className="hidden 2xl:grid 2xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1.25fr)_132px] 2xl:gap-4">
        <section className="min-w-0 rounded-[22px] border border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-slate-500">
              {item.sellerName}
            </p>
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[item.statusLabel as keyof typeof statusTone] ?? "bg-slate-100 text-slate-600"}`}
            >
              {item.statusLabel}
            </span>
            {item.dealStage !== "none" ? (
              <span className="whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white">
                {item.dealStage}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 truncate text-lg font-semibold text-slate-950">
            {vehicleLabel}
          </h3>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${purchaseMethodTone[item.purchaseMethod]}`}
            >
              {item.purchaseMethod}
            </span>
            <span className="whitespace-nowrap rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-600">
              {marketLabel}
            </span>
            <span className="whitespace-nowrap rounded-lg bg-white px-2.5 py-1 font-medium text-slate-600">
              {item.regionLabel}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <InlineMetric label="연식" value={item.yearLabel} />
            <InlineMetric label="주행거리" value={item.mileageLabel} />
            <InlineMetric label="희망 금액" value={item.askingPriceLabel} />
            <InlineMetric label="마감 시각" value={formatDeadlineLabel(item.deadlineAt)} />
          </div>
        </section>

        <section className="grid gap-2 sm:grid-cols-2">
          <Metric label="남은 시간" value={remainingTime} />
          <Metric
            label="입찰 / 조회"
            value={`${item.bidCount.toLocaleString("ko-KR")}명 / ${item.viewCount.toLocaleString("ko-KR")}회`}
          />
          <Metric label="거래 상태" value={item.dealStage === "none" ? "후속 거래 없음" : item.dealStage} />
          <Metric label="다음 이동" value={primaryAction.label} />
        </section>

        <section className="flex flex-col gap-2">
          <FavoriteButton
            disabled={isFavoritePending}
            isFavorited={item.isFavorited}
            label={item.isFavorited ? "찜 해제" : "찜"}
            onClick={() => onFavoriteToggle(item.id)}
          />
          <PrimaryActionButton action={primaryAction} fullWidth />
          <SecondaryActionButton fullWidth href={appRoutes.homeAuctionDetail(item.id)} />
        </section>
      </div>
    </article>
  );
}

type FavoriteButtonProps = {
  disabled: boolean;
  isFavorited: boolean;
  label?: string;
  onClick: () => void;
};

function FavoriteButton({
  disabled,
  isFavorited,
  label,
  onClick,
}: FavoriteButtonProps) {
  return (
    <button
      aria-label={isFavorited ? "찜 해제" : "찜하기"}
      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label ? `${isFavorited ? "♥" : "♡"} ${label}` : isFavorited ? "♥" : "♡"}
    </button>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-2 text-sm font-semibold text-slate-950 tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function InlineMetric({ label, value }: MetricProps) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950 tabular-nums">
        {value}
      </p>
    </div>
  );
}

type PrimaryActionButtonProps = {
  action: ReturnType<typeof getPrimaryAction>;
  fullWidth?: boolean;
};

function PrimaryActionButton({
  action,
  fullWidth = false,
}: PrimaryActionButtonProps) {
  const className = fullWidth
    ? "block w-full rounded-2xl bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white"
    : "rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white";

  if (action.href) {
    return (
      <Link className={className} href={action.href}>
        {action.label}
      </Link>
    );
  }

  return (
    <button
      className={fullWidth
        ? "w-full rounded-2xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"
        : "rounded-2xl bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500"}
      disabled
      type="button"
    >
      {action.label}
    </button>
  );
}

type SecondaryActionButtonProps = {
  href: string;
  fullWidth?: boolean;
};

function SecondaryActionButton({
  href,
  fullWidth = false,
}: SecondaryActionButtonProps) {
  return (
    <Link
      className={fullWidth
        ? "block w-full rounded-2xl border border-line px-4 py-2.5 text-center text-sm font-medium text-slate-700"
        : "rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-slate-700"}
      href={href}
    >
      상세
    </Link>
  );
}
