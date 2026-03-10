import Link from "next/link";
import { HomeAuctionCard, type HomeAuctionCardItem } from "@/features/home/components/home-auction-card";
import { SectionCard } from "@/shared/ui/section-card";
import { appRoutes } from "@/shared/config/routes";

const allAuctionItems: HomeAuctionCardItem[] = [
  {
    id: "auction-001",
    title: "BMW 5 Series 520i",
    priceLabel: "62,400,000원",
    deadlineLabel: "03.10 18:30",
    isFavorite: false,
    statusLabel: "경매중",
  },
  {
    id: "auction-002",
    title: "Kia Carnival Hybrid",
    priceLabel: "48,100,000원",
    deadlineLabel: "03.10 19:10",
    isFavorite: true,
    statusLabel: "경매중",
  },
  {
    id: "auction-003",
    title: "Mercedes-Benz E 220d",
    priceLabel: "77,900,000원",
    deadlineLabel: "03.10 21:00",
    isFavorite: true,
    statusLabel: "마감 임박",
  },
];

type HomeAuctionListSectionProps = {
  currentTab: "all" | "favorite";
};

export function HomeAuctionListSection({
  currentTab,
}: HomeAuctionListSectionProps) {
  const visibleItems =
    currentTab === "favorite"
      ? allAuctionItems.filter((item) => item.isFavorite)
      : allAuctionItems;

  return (
    <SectionCard
      title={currentTab === "favorite" ? "찜한 차" : "전체 경매"}
      description="Flutter dealer home의 2탭 구조를 유지하되, web에서는 넓은 작업대와 card grid로 재배치합니다."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        <TabLink
          href={appRoutes.home()}
          label="전체"
          isActive={currentTab === "all"}
        />
        <TabLink
          href={appRoutes.home({ tab: "favorite" })}
          label="찜한 차"
          isActive={currentTab === "favorite"}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {visibleItems.map((item) => (
          <HomeAuctionCard key={item.id} item={item} />
        ))}
      </div>
    </SectionCard>
  );
}

type TabLinkProps = {
  href: string;
  label: string;
  isActive: boolean;
};

function TabLink({ href, label, isActive }: TabLinkProps) {
  return (
    <Link
      className={
        isActive
          ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          : "rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600"
      }
      href={href}
    >
      {label}
    </Link>
  );
}
