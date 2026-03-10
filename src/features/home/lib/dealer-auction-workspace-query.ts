import { queryOptions } from "@tanstack/react-query";
import { dealerAuctionBriefSchema, type DealerAuctionBrief } from "@/entities/auction/schemas/dealer-auction-brief-schema";

export type DealerAuctionWorkspaceMode = "home" | "favorites";
export type DealerAuctionImportFilter = "all" | "domestic" | "imported";
export type DealerAuctionSort = "latest" | "price";

export type DealerAuctionWorkspaceFilters = {
  search: string;
  importFilter: DealerAuctionImportFilter;
  sort: DealerAuctionSort;
};

export type DealerAuctionWorkspaceSummary = {
  totalAuctions: number;
  favoriteAuctions: number;
  bidCount: number;
  dealCount: number;
  visibleCount: number;
};

export type DealerAuctionWorkspaceData = {
  items: DealerAuctionBrief[];
  summary: DealerAuctionWorkspaceSummary;
};

const mockAuctionRecords = dealerAuctionBriefSchema.array().parse([
  {
    id: "auction-001",
    sellerName: "김*현",
    brandName: "BMW",
    modelName: "520i",
    trimName: "M Sport Package",
    purchaseMethod: "리스",
    regionLabel: "서울 서초구",
    isFavorited: false,
    isImported: true,
    openedAt: "2026-03-10T08:30:00.000Z",
    deadlineAt: "2026-03-10T09:30:00.000Z",
    yearLabel: "2023년식",
    mileageLabel: "12,340km",
    askingPriceValue: 62400000,
    askingPriceLabel: "62,400,000원",
    bidState: "open",
    statusLabel: "경매중",
    dealStage: "none",
  },
  {
    id: "auction-002",
    sellerName: "박*민",
    brandName: "기아",
    modelName: "카니발 하이리무진",
    trimName: "시그니처 9인승",
    purchaseMethod: "할부",
    regionLabel: "경기 성남시",
    isFavorited: true,
    isImported: false,
    openedAt: "2026-03-10T08:10:00.000Z",
    deadlineAt: "2026-03-10T10:10:00.000Z",
    yearLabel: "2024년식",
    mileageLabel: "4,210km",
    askingPriceValue: 48100000,
    askingPriceLabel: "48,100,000원",
    bidState: "my_bid",
    statusLabel: "내 입찰 진행",
    dealStage: "서류 확인",
  },
  {
    id: "auction-003",
    sellerName: "이*진",
    brandName: "벤츠",
    modelName: "E 220d",
    trimName: "Avantgarde",
    purchaseMethod: "리스",
    regionLabel: "부산 해운대구",
    isFavorited: true,
    isImported: true,
    openedAt: "2026-03-10T07:50:00.000Z",
    deadlineAt: "2026-03-10T08:55:00.000Z",
    yearLabel: "2023년식",
    mileageLabel: "7,980km",
    askingPriceValue: 77900000,
    askingPriceLabel: "77,900,000원",
    bidState: "closing",
    statusLabel: "마감 임박",
    dealStage: "none",
  },
  {
    id: "auction-004",
    sellerName: "최*준",
    brandName: "현대",
    modelName: "팰리세이드",
    trimName: "캘리그래피",
    purchaseMethod: "현금",
    regionLabel: "인천 연수구",
    isFavorited: false,
    isImported: false,
    openedAt: "2026-03-10T07:20:00.000Z",
    deadlineAt: "2026-03-10T11:00:00.000Z",
    yearLabel: "2022년식",
    mileageLabel: "26,100km",
    askingPriceValue: 43800000,
    askingPriceLabel: "43,800,000원",
    bidState: "open",
    statusLabel: "경매중",
    dealStage: "none",
  },
  {
    id: "auction-005",
    sellerName: "정*아",
    brandName: "제네시스",
    modelName: "GV80",
    trimName: "2.5T AWD",
    purchaseMethod: "할부",
    regionLabel: "대전 유성구",
    isFavorited: true,
    isImported: false,
    openedAt: "2026-03-10T06:45:00.000Z",
    deadlineAt: "2026-03-10T07:45:00.000Z",
    yearLabel: "2021년식",
    mileageLabel: "38,200km",
    askingPriceValue: 51200000,
    askingPriceLabel: "51,200,000원",
    bidState: "closed",
    statusLabel: "경매 종료",
    dealStage: "none",
  },
  {
    id: "auction-006",
    sellerName: "한*우",
    brandName: "볼보",
    modelName: "XC60",
    trimName: "B6 Inscription",
    purchaseMethod: "현금",
    regionLabel: "광주 서구",
    isFavorited: false,
    isImported: true,
    openedAt: "2026-03-10T06:10:00.000Z",
    deadlineAt: "2026-03-10T09:45:00.000Z",
    yearLabel: "2022년식",
    mileageLabel: "21,540km",
    askingPriceValue: 55900000,
    askingPriceLabel: "55,900,000원",
    bidState: "my_bid",
    statusLabel: "내 입찰 진행",
    dealStage: "계약 입력 대기",
  },
  {
    id: "auction-007",
    sellerName: "윤*혁",
    brandName: "기아",
    modelName: "EV9",
    trimName: "GT-Line",
    purchaseMethod: "리스",
    regionLabel: "울산 남구",
    isFavorited: true,
    isImported: false,
    openedAt: "2026-03-10T05:45:00.000Z",
    deadlineAt: "2026-03-10T12:00:00.000Z",
    yearLabel: "2024년식",
    mileageLabel: "1,240km",
    askingPriceValue: 73400000,
    askingPriceLabel: "73,400,000원",
    bidState: "open",
    statusLabel: "경매중",
    dealStage: "출고 준비",
  },
  {
    id: "auction-008",
    sellerName: "오*람",
    brandName: "아우디",
    modelName: "A6",
    trimName: "45 TFSI quattro",
    purchaseMethod: "할부",
    regionLabel: "서울 강남구",
    isFavorited: false,
    isImported: true,
    openedAt: "2026-03-10T05:20:00.000Z",
    deadlineAt: "2026-03-10T13:30:00.000Z",
    yearLabel: "2022년식",
    mileageLabel: "15,980km",
    askingPriceValue: 60300000,
    askingPriceLabel: "60,300,000원",
    bidState: "open",
    statusLabel: "경매중",
    dealStage: "none",
  },
]);

export const dealerAuctionWorkspaceQueryRoot = [
  "dealer-auction-workspace",
] as const;

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getSummary(records: DealerAuctionBrief[]): DealerAuctionWorkspaceSummary {
  return {
    totalAuctions: records.length,
    favoriteAuctions: records.filter((record) => record.isFavorited).length,
    bidCount: records.filter((record) => record.bidState === "my_bid").length,
    dealCount: records.filter((record) => record.dealStage !== "none").length,
    visibleCount: 0,
  };
}

function filterAuctions(
  records: DealerAuctionBrief[],
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  const visibleRecords = records
    .filter((record) => {
      if (mode === "favorites" && !record.isFavorited) {
        return false;
      }

      if (filters.importFilter === "domestic" && record.isImported) {
        return false;
      }

      if (filters.importFilter === "imported" && !record.isImported) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        record.sellerName,
        record.brandName,
        record.modelName,
        record.trimName,
        record.regionLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((left, right) => {
      if (filters.sort === "price") {
        return right.askingPriceValue - left.askingPriceValue;
      }

      return Date.parse(right.openedAt) - Date.parse(left.openedAt);
    });

  return visibleRecords;
}

export function getDealerAuctionWorkspaceQueryKey(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  return [
    ...dealerAuctionWorkspaceQueryRoot,
    mode,
    filters.search,
    filters.importFilter,
    filters.sort,
  ] as const;
}

export async function getDealerAuctionWorkspace(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
): Promise<DealerAuctionWorkspaceData> {
  await wait(180);

  const visibleRecords = filterAuctions(mockAuctionRecords, mode, filters);
  const summary = getSummary(mockAuctionRecords);

  return {
    items: visibleRecords,
    summary: {
      ...summary,
      visibleCount: visibleRecords.length,
    },
  };
}

export async function toggleDealerAuctionFavorite(auctionId: string) {
  await wait(120);

  const targetIndex = mockAuctionRecords.findIndex((record) => record.id === auctionId);

  if (targetIndex === -1) {
    throw new Error("존재하지 않는 경매입니다.");
  }

  const currentRecord = mockAuctionRecords[targetIndex];
  mockAuctionRecords[targetIndex] = {
    ...currentRecord,
    isFavorited: !currentRecord.isFavorited,
  };

  return mockAuctionRecords[targetIndex];
}

export function getDealerAuctionWorkspaceQueryOptions(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  return queryOptions({
    queryKey: getDealerAuctionWorkspaceQueryKey(mode, filters),
    queryFn: () => getDealerAuctionWorkspace(mode, filters),
    refetchInterval: mode === "home" ? 10000 : false,
  });
}

export function findDealerAuctionById(auctionId: string) {
  return mockAuctionRecords.find((record) => record.id === auctionId) ?? null;
}
