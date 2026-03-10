import Link from "next/link";
import type { DealerAuctionBrief } from "@/entities/auction/schemas/dealer-auction-brief-schema";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type DealerAuctionDetailPageProps = {
  auction: DealerAuctionBrief;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function resolvePrimaryAction(auction: DealerAuctionBrief) {
  if (auction.bidState === "my_bid") {
    return {
      href: appRoutes.bids(),
      label: "내 입찰 확인",
      disabled: false,
    };
  }

  if (auction.bidState === "closed") {
    return {
      href: "",
      label: "경매 종료",
      disabled: true,
    };
  }

  return {
    href: appRoutes.bids(),
    label: "입찰 흐름 연결 예정",
    disabled: false,
  };
}

export function DealerAuctionDetailPage({
  auction,
}: DealerAuctionDetailPageProps) {
  const primaryAction = resolvePrimaryAction(auction);

  return (
    <section className="space-y-6">
      <header className="rounded-[32px] border border-white/80 bg-white/92 px-6 py-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Auction Detail
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {auction.brandName} {auction.modelName}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{auction.trimName}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">{auction.sellerName}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{auction.purchaseMethod}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{auction.regionLabel}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{auction.statusLabel}</span>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="경매 요약"
          description="Flutter auction detail에서 바로 판단해야 하는 핵심 필드만 먼저 옮겼습니다."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailMetric label="희망 금액" value={auction.askingPriceLabel} />
            <DetailMetric label="마감 시각" value={formatDateLabel(auction.deadlineAt)} />
            <DetailMetric label="연식" value={auction.yearLabel} />
            <DetailMetric label="주행거리" value={auction.mileageLabel} />
          </div>
        </SectionCard>

        <SectionCard
          title="다음 액션"
          description="모바일과 동일하게 상태에 따라 CTA 의미가 바뀌도록 스캐폴딩했습니다."
        >
          <div className="space-y-3">
            {primaryAction.disabled ? (
              <button
                className="w-full rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-500"
                disabled
                type="button"
              >
                {primaryAction.label}
              </button>
            ) : (
              <Link
                className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white"
                href={primaryAction.href}
              >
                {primaryAction.label}
              </Link>
            )}
            <Link
              className="block rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
              href={appRoutes.home()}
            >
              경매장 홈으로 돌아가기
            </Link>
          </div>
          {auction.dealStage !== "none" ? (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              현재 거래 후속 상태: <strong>{auction.dealStage}</strong>
            </p>
          ) : null}
        </SectionCard>
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
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
