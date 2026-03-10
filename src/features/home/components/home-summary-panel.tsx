import Link from "next/link";
import type {
  DealerAuctionWorkspaceMode,
  DealerAuctionWorkspaceSummary,
} from "@/features/home/lib/dealer-auction-workspace-query";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type HomeSummaryPanelProps = {
  mode: DealerAuctionWorkspaceMode;
  summary: DealerAuctionWorkspaceSummary;
};

export function HomeSummaryPanel({ mode, summary }: HomeSummaryPanelProps) {
  const summaryItems = [
    {
      href: appRoutes.home(),
      label: "경매장 홈",
      value: summary.totalAuctions.toLocaleString("ko-KR"),
      description: "전체 경매",
      isActive: mode === "home",
    },
    {
      href: appRoutes.favorites(),
      label: "찜한 차",
      value: summary.favoriteAuctions.toLocaleString("ko-KR"),
      description: "즐겨찾기",
      isActive: mode === "favorites",
    },
    {
      href: appRoutes.bids(),
      label: "내 입찰",
      value: summary.bidCount.toLocaleString("ko-KR"),
      description: "진행 중",
      isActive: false,
    },
    {
      href: appRoutes.deals(),
      label: "내 거래",
      value: summary.dealCount.toLocaleString("ko-KR"),
      description: "후속 진행",
      isActive: false,
    },
  ] as const;

  return (
    <SectionCard
      title="운영 브리프"
      description="앱의 바텀탭 의미를 웹 좌측 IA에 맞게 다시 배치하고, 현재 작업량을 상단에서 바로 이동할 수 있게 정리했습니다."
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <Link
            href={item.href}
            key={item.label}
            className={
              item.isActive
                ? "rounded-3xl border border-slate-950 bg-slate-950 p-5 text-white"
                : "rounded-3xl border border-line bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
            }
          >
            <p
              className={
                item.isActive ? "text-sm text-slate-300" : "text-sm text-slate-500"
              }
            >
              {item.label}
            </p>
            <p
              className={
                item.isActive
                  ? "mt-3 text-3xl font-semibold text-white"
                  : "mt-3 text-3xl font-semibold text-slate-950"
              }
            >
              {item.value}
            </p>
            <p
              className={
                item.isActive
                  ? "mt-2 text-sm text-slate-300"
                  : "mt-2 text-sm text-slate-500"
              }
            >
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
