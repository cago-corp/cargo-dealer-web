import Link from "next/link";
import { appRoutes } from "@/shared/config/routes";

export type HomeAuctionCardItem = {
  id: string;
  title: string;
  priceLabel: string;
  deadlineLabel: string;
  isFavorite: boolean;
  statusLabel: string;
};

type HomeAuctionCardProps = {
  item: HomeAuctionCardItem;
};

export function HomeAuctionCard({ item }: HomeAuctionCardProps) {
  return (
    <article className="rounded-[28px] border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Auction
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {item.statusLabel}
        </span>
      </div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="기준 금액" value={item.priceLabel} />
        <Metric label="마감 시각" value={item.deadlineLabel} />
        <Metric label="찜 상태" value={item.isFavorite ? "찜한 차" : "미선택"} />
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
          href={appRoutes.quote()}
        >
          상세 / 입찰 이동
        </Link>
        <button
          className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
          type="button"
        >
          {item.isFavorite ? "찜 해제" : "찜하기"}
        </button>
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
