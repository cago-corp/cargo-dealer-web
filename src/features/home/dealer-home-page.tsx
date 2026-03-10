import { HomeAuctionListSection } from "@/features/home/components/home-auction-list-section";
import { HomeSummaryPanel } from "@/features/home/components/home-summary-panel";

type DealerHomePageProps = {
  currentTab: "all" | "favorite";
};

export function DealerHomePage({ currentTab }: DealerHomePageProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Home
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">딜러 홈</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Flutter dealer의 `전체 / 찜한 차` 구조를 먼저 고정하고, 이후 실제 경매
          목록과 정렬/필터를 API 계약에 맞춰 이어붙일 수 있게 최소 골격을 맞췄습니다.
        </p>
      </header>
      <HomeSummaryPanel />
      <HomeAuctionListSection currentTab={currentTab} />
    </section>
  );
}
