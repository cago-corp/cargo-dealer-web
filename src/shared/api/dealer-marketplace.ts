import { z } from "zod";
import {
  dealerAuctionBriefSchema,
  type DealerAuctionBrief,
} from "@/entities/auction/schemas/dealer-auction-brief-schema";
import {
  dealerAuctionDetailSchema,
  type DealerAuctionDetail,
} from "@/entities/auction/schemas/dealer-auction-detail-schema";
import {
  dealerAuctionWorkspaceDataSchema,
  type DealerAuctionWorkspaceData,
  type DealerAuctionWorkspaceFilters,
  type DealerAuctionWorkspaceMode,
  type DealerAuctionWorkspaceSummary,
} from "@/entities/auction/schemas/dealer-auction-workspace-schema";
import {
  dealerBidCapitalOptionSchema,
  dealerBidDetailSchema,
  dealerBidListItemSchema,
  dealerBidServiceOptionSchema,
  dealerBidSubmissionSchema,
  dealerBidSuccessSchema,
  type DealerBidCapitalOption,
  type DealerBidDetail,
  type DealerBidListItem,
  type DealerBidServiceOption,
  type DealerBidSubmission,
  type DealerBidSuccess,
} from "@/entities/bid/schemas/dealer-bid-schema";

const dealerMarketplaceLatency = 140;

const rawAuctionRecordSchema = z.object({
  id: z.string(),
  sellerName: z.string(),
  brandName: z.string(),
  modelName: z.string(),
  trimName: z.string(),
  purchaseMethod: z.enum(["현금", "할부", "리스"]),
  regionLabel: z.string(),
  isFavorited: z.boolean(),
  isImported: z.boolean(),
  openedAt: z.string().datetime(),
  deadlineAt: z.string().datetime(),
  yearLabel: z.string(),
  mileageLabel: z.string(),
  askingPriceValue: z.number().int().positive(),
  askingPriceLabel: z.string(),
  dealStage: z.enum(["none", "서류 확인", "계약 입력 대기", "출고 준비"]),
  imageUrl: z.string().nullable(),
  brandLogoImageUrl: z.string().nullable(),
  viewCount: z.number().int().nonnegative(),
  bidCount: z.number().int().nonnegative(),
  fuelType: z.string(),
  statusCode: z.enum(["경매중", "경매 종료"]),
  contractMonths: z.number().int().positive().nullable(),
  advanceDownPaymentAmount: z.number().int().nonnegative().nullable(),
  depositDownPaymentAmount: z.number().int().nonnegative().nullable(),
  annualMileage: z.number().int().nonnegative().nullable(),
  deliveryRegion: z.string(),
  userRegion: z.string(),
  customerType: z.string().nullable(),
  vehicleExteriorColorName: z.string().nullable(),
  vehicleInteriorColorName: z.string().nullable(),
  description: z.string(),
});

type RawAuctionRecord = z.infer<typeof rawAuctionRecordSchema>;

const serviceOptions = dealerBidServiceOptionSchema.array().parse([
  {
    id: "service-001",
    name: "블랙박스",
    description: "2채널 블랙박스 기본 장착",
  },
  {
    id: "service-002",
    name: "틴팅",
    description: "전면/측후면 틴팅 시공",
  },
  {
    id: "service-003",
    name: "보험 대행",
    description: "출고 보험 가입 지원",
  },
  {
    id: "service-004",
    name: "방문 시승",
    description: "고객 방문 시승 일정 조율",
  },
]);

const capitalOptions = dealerBidCapitalOptionSchema.array().parse([
  { id: "capital-001", name: "현대캐피탈" },
  { id: "capital-002", name: "KB캐피탈" },
  { id: "capital-003", name: "하나캐피탈" },
]);

const rawAuctionRecords = rawAuctionRecordSchema.array().parse([
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
    dealStage: "none",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 19,
    bidCount: 3,
    fuelType: "가솔린",
    statusCode: "경매중",
    contractMonths: 36,
    advanceDownPaymentAmount: 3000000,
    depositDownPaymentAmount: 5000000,
    annualMileage: 20000,
    deliveryRegion: "서울 강남구",
    userRegion: "서울 서초구",
    customerType: "개인사업자",
    vehicleExteriorColorName: "블랙",
    vehicleInteriorColorName: "브라운",
    description: "리스 승계 종료 예정으로 빠른 견적 비교를 희망합니다.",
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
    dealStage: "서류 확인",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 27,
    bidCount: 5,
    fuelType: "하이브리드",
    statusCode: "경매중",
    contractMonths: 48,
    advanceDownPaymentAmount: 5000000,
    depositDownPaymentAmount: null,
    annualMileage: null,
    deliveryRegion: "경기 성남시",
    userRegion: "경기 용인시",
    customerType: "법인",
    vehicleExteriorColorName: "화이트",
    vehicleInteriorColorName: "베이지",
    description: "패밀리카 교체 수요로 빠른 출고 가능한 조건을 우선 확인합니다.",
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
    dealStage: "none",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 12,
    bidCount: 2,
    fuelType: "디젤",
    statusCode: "경매중",
    contractMonths: 36,
    advanceDownPaymentAmount: 0,
    depositDownPaymentAmount: 7000000,
    annualMileage: 15000,
    deliveryRegion: "부산 해운대구",
    userRegion: "부산 수영구",
    customerType: "개인",
    vehicleExteriorColorName: "그레이",
    vehicleInteriorColorName: "블랙",
    description: "만기 전 교체 문의가 많아 마감 직전까지 비교 예정입니다.",
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
    dealStage: "none",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 8,
    bidCount: 1,
    fuelType: "가솔린",
    statusCode: "경매중",
    contractMonths: null,
    advanceDownPaymentAmount: null,
    depositDownPaymentAmount: null,
    annualMileage: null,
    deliveryRegion: "인천 연수구",
    userRegion: "인천 남동구",
    customerType: null,
    vehicleExteriorColorName: "검정",
    vehicleInteriorColorName: "검정",
    description: "현금 매입 조건 위주로 빠른 출고를 희망합니다.",
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
    dealStage: "none",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 31,
    bidCount: 6,
    fuelType: "가솔린",
    statusCode: "경매 종료",
    contractMonths: 60,
    advanceDownPaymentAmount: 7000000,
    depositDownPaymentAmount: null,
    annualMileage: null,
    deliveryRegion: "대전 유성구",
    userRegion: "세종",
    customerType: "법인",
    vehicleExteriorColorName: "화이트",
    vehicleInteriorColorName: "브라운",
    description: "마감된 경매로 결과 대기 상태입니다.",
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
    dealStage: "계약 입력 대기",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 14,
    bidCount: 4,
    fuelType: "가솔린",
    statusCode: "경매중",
    contractMonths: null,
    advanceDownPaymentAmount: null,
    depositDownPaymentAmount: null,
    annualMileage: null,
    deliveryRegion: "광주 서구",
    userRegion: "광주 남구",
    customerType: null,
    vehicleExteriorColorName: "실버",
    vehicleInteriorColorName: "블랙",
    description: "현금 매입과 계약 입력까지 빠르게 진행 중인 케이스입니다.",
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
    dealStage: "출고 준비",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 22,
    bidCount: 3,
    fuelType: "전기",
    statusCode: "경매중",
    contractMonths: 48,
    advanceDownPaymentAmount: 8000000,
    depositDownPaymentAmount: 12000000,
    annualMileage: 18000,
    deliveryRegion: "울산 남구",
    userRegion: "울산 북구",
    customerType: "법인",
    vehicleExteriorColorName: "네이비",
    vehicleInteriorColorName: "그레이",
    description: "법인 리스 갱신 건으로 캐피탈 비교가 중요합니다.",
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
    dealStage: "none",
    imageUrl: null,
    brandLogoImageUrl: null,
    viewCount: 9,
    bidCount: 2,
    fuelType: "가솔린",
    statusCode: "경매중",
    contractMonths: 48,
    advanceDownPaymentAmount: 6000000,
    depositDownPaymentAmount: null,
    annualMileage: null,
    deliveryRegion: "서울 강남구",
    userRegion: "서울 송파구",
    customerType: "개인",
    vehicleExteriorColorName: "화이트",
    vehicleInteriorColorName: "블랙",
    description: "할부 비교 견적 위주로 보는 일반 경매 건입니다.",
  },
]);

let bidSubmissionRecords = dealerBidSubmissionSchema.array().parse([
  {
    id: "submission-001",
    auctionId: "auction-002",
    purchaseMethod: "할부",
    monthlyPaymentValue: 489000,
    discountAmountValue: 1200000,
    capitalId: null,
    capitalName: null,
    note: "출고 전 썬팅 포함 조건으로 제안했습니다.",
    currentRank: 2,
    services: [serviceOptions[1], serviceOptions[2]],
    state: "bidding",
    submittedAt: "2026-03-10T08:55:00.000Z",
  },
  {
    id: "submission-002",
    auctionId: "auction-006",
    purchaseMethod: "현금",
    monthlyPaymentValue: null,
    discountAmountValue: 2200000,
    capitalId: null,
    capitalName: null,
    note: "당일 계약 가능 조건으로 진행합니다.",
    currentRank: 1,
    services: [serviceOptions[0]],
    state: "contract_pending",
    submittedAt: "2026-03-10T07:15:00.000Z",
  },
]);

function delay(ms = dealerMarketplaceLatency) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getSubmissionByAuctionId(auctionId: string) {
  return (
    bidSubmissionRecords
      .filter((submission) => submission.auctionId === auctionId)
      .sort(
        (left, right) =>
          Date.parse(right.submittedAt) - Date.parse(left.submittedAt),
      )[0] ?? null
  );
}

function resolveBidState(record: RawAuctionRecord) {
  const myBid = getSubmissionByAuctionId(record.id);

  if (myBid) {
    return "my_bid" as const;
  }

  if (record.statusCode === "경매 종료" || Date.parse(record.deadlineAt) <= Date.now()) {
    return "closed" as const;
  }

  const remainingMilliseconds = Date.parse(record.deadlineAt) - Date.now();
  if (remainingMilliseconds <= 90 * 60 * 1000) {
    return "closing" as const;
  }

  return "open" as const;
}

function resolveStatusLabel(record: RawAuctionRecord) {
  const myBid = getSubmissionByAuctionId(record.id);
  if (myBid) {
    return myBid.state === "contract_pending" ? "계약 진행" : "내 입찰 진행";
  }

  if (record.statusCode === "경매 종료" || Date.parse(record.deadlineAt) <= Date.now()) {
    return "경매 종료";
  }

  const remainingMilliseconds = Date.parse(record.deadlineAt) - Date.now();
  if (remainingMilliseconds <= 90 * 60 * 1000) {
    return "마감 임박";
  }

  return "경매중";
}

function formatVehicleLabel(record: RawAuctionRecord) {
  return `${record.brandName} ${record.modelName} ${record.trimName}`;
}

function toAuctionBrief(record: RawAuctionRecord): DealerAuctionBrief {
  return dealerAuctionBriefSchema.parse({
    id: record.id,
    sellerName: record.sellerName,
    brandName: record.brandName,
    modelName: record.modelName,
    trimName: record.trimName,
    purchaseMethod: record.purchaseMethod,
    regionLabel: record.regionLabel,
    isFavorited: record.isFavorited,
    isImported: record.isImported,
    openedAt: record.openedAt,
    deadlineAt: record.deadlineAt,
    yearLabel: record.yearLabel,
    mileageLabel: record.mileageLabel,
    askingPriceValue: record.askingPriceValue,
    askingPriceLabel: record.askingPriceLabel,
    bidState: resolveBidState(record),
    statusLabel: resolveStatusLabel(record),
    dealStage: record.dealStage,
  });
}

function toAuctionDetail(record: RawAuctionRecord): DealerAuctionDetail {
  const brief = toAuctionBrief(record);
  const myBid = getSubmissionByAuctionId(record.id);

  return dealerAuctionDetailSchema.parse({
    ...brief,
    imageUrl: record.imageUrl,
    brandLogoImageUrl: record.brandLogoImageUrl,
    viewCount: record.viewCount,
    bidCount: record.bidCount,
    fuelType: record.fuelType,
    statusCode: record.statusCode,
    contractMonths: record.contractMonths,
    advanceDownPaymentAmount: record.advanceDownPaymentAmount,
    depositDownPaymentAmount: record.depositDownPaymentAmount,
    annualMileage: record.annualMileage,
    deliveryRegion: record.deliveryRegion,
    userRegion: record.userRegion,
    customerType: record.customerType,
    vehicleExteriorColorName: record.vehicleExteriorColorName,
    vehicleInteriorColorName: record.vehicleInteriorColorName,
    description: record.description,
    myBidSubmissionId: myBid?.id ?? null,
  });
}

function getWorkspaceSummary(): DealerAuctionWorkspaceSummary {
  return {
    totalAuctions: rawAuctionRecords.length,
    favoriteAuctions: rawAuctionRecords.filter((record) => record.isFavorited).length,
    bidCount: bidSubmissionRecords.length,
    dealCount: rawAuctionRecords.filter((record) => record.dealStage !== "none").length,
    visibleCount: 0,
  };
}

function filterWorkspaceAuctions(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
) {
  const normalizedSearch = filters.search.trim().toLowerCase();

  return rawAuctionRecords
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
    .map(toAuctionBrief)
    .sort((left, right) => {
      if (filters.sort === "price") {
        return right.askingPriceValue - left.askingPriceValue;
      }

      return Date.parse(right.openedAt) - Date.parse(left.openedAt);
    });
}

function formatBidListStatus(submission: DealerBidSubmission) {
  switch (submission.state) {
    case "contract_pending":
      return "계약 입력 대기";
    case "completed":
      return "출고 완료";
    case "closed":
      return "경매 종료";
    default:
      return "입찰 진행";
  }
}

export async function fetchDealerAuctionWorkspace(
  mode: DealerAuctionWorkspaceMode,
  filters: DealerAuctionWorkspaceFilters,
): Promise<DealerAuctionWorkspaceData> {
  await delay();

  const items = filterWorkspaceAuctions(mode, filters);
  const summary = getWorkspaceSummary();

  return dealerAuctionWorkspaceDataSchema.parse({
    items,
    summary: {
      ...summary,
      visibleCount: items.length,
    },
  });
}

export async function fetchDealerAuctionDetail(auctionId: string) {
  await delay();

  const record = rawAuctionRecords.find((candidate) => candidate.id === auctionId);
  if (!record) {
    throw new Error("경매를 찾을 수 없습니다.");
  }

  return toAuctionDetail(record);
}

export async function toggleDealerAuctionFavorite(auctionId: string) {
  await delay(90);

  const targetIndex = rawAuctionRecords.findIndex((record) => record.id === auctionId);

  if (targetIndex === -1) {
    throw new Error("경매를 찾을 수 없습니다.");
  }

  rawAuctionRecords[targetIndex] = {
    ...rawAuctionRecords[targetIndex],
    isFavorited: !rawAuctionRecords[targetIndex].isFavorited,
  };

  return toAuctionDetail(rawAuctionRecords[targetIndex]);
}

export function listDealerBidServiceOptions(): DealerBidServiceOption[] {
  return [...serviceOptions];
}

export function listDealerBidCapitalOptions(): DealerBidCapitalOption[] {
  return [...capitalOptions];
}

export async function fetchDealerBidList(): Promise<DealerBidListItem[]> {
  await delay();

  const items = bidSubmissionRecords
    .map((submission) => {
      const record = rawAuctionRecords.find(
        (candidate) => candidate.id === submission.auctionId,
      );

      if (!record) {
        return null;
      }

      return dealerBidListItemSchema.parse({
        submissionId: submission.id,
        auctionId: record.id,
        vehicleLabel: formatVehicleLabel(record),
        purchaseMethod: submission.purchaseMethod,
        yearLabel: record.yearLabel,
        fuelType: record.fuelType,
        bidCount: record.bidCount,
        deadlineAt: record.deadlineAt,
        statusLabel: formatBidListStatus(submission),
        currentRank: submission.currentRank,
      });
    })
    .filter((item): item is DealerBidListItem => item !== null)
    .sort((left, right) => {
      const leftSubmission = bidSubmissionRecords.find(
        (submission) => submission.id === left.submissionId,
      );
      const rightSubmission = bidSubmissionRecords.find(
        (submission) => submission.id === right.submissionId,
      );

      return (
        Date.parse(rightSubmission?.submittedAt ?? right.deadlineAt) -
        Date.parse(leftSubmission?.submittedAt ?? left.deadlineAt)
      );
    });

  return items;
}

export async function fetchDealerBidDetail(
  auctionId: string,
): Promise<DealerBidDetail> {
  await delay();

  const record = rawAuctionRecords.find((candidate) => candidate.id === auctionId);
  const submission = getSubmissionByAuctionId(auctionId);

  if (!record || !submission) {
    throw new Error("내 입찰 상세를 찾을 수 없습니다.");
  }

  return dealerBidDetailSchema.parse({
    auction: toAuctionDetail(record),
    submission,
    totalBidders: Math.max(record.bidCount, 1),
  });
}

export async function fetchDealerBidRank(auctionId: string) {
  await delay(320);

  const submission = getSubmissionByAuctionId(auctionId);

  if (!submission) {
    return null;
  }

  return submission.currentRank;
}

type SubmitDealerBidInput = {
  auctionId: string;
  purchaseMethod: DealerAuctionDetail["purchaseMethod"];
  selectedServiceIds: string[];
  note: string;
  monthlyPaymentValue: number | null;
  discountAmountValue: number;
  capitalId: string | null;
};

export async function submitDealerBid(input: SubmitDealerBidInput) {
  await delay(260);

  const auctionIndex = rawAuctionRecords.findIndex(
    (record) => record.id === input.auctionId,
  );

  if (auctionIndex === -1) {
    throw new Error("입찰 대상 경매를 찾을 수 없습니다.");
  }

  const auctionRecord = rawAuctionRecords[auctionIndex];
  const selectedServices = serviceOptions.filter((option) =>
    input.selectedServiceIds.includes(option.id),
  );
  const selectedCapital =
    capitalOptions.find((option) => option.id === input.capitalId) ?? null;

  const submission = dealerBidSubmissionSchema.parse({
    id: `submission-${Date.now()}`,
    auctionId: input.auctionId,
    purchaseMethod: input.purchaseMethod,
    monthlyPaymentValue: input.monthlyPaymentValue,
    discountAmountValue: input.discountAmountValue,
    capitalId: selectedCapital?.id ?? null,
    capitalName: selectedCapital?.name ?? null,
    note: input.note,
    currentRank: Math.max(1, Math.ceil((auctionRecord.bidCount + 1) / 2)),
    services: selectedServices,
    state: "bidding",
    submittedAt: new Date().toISOString(),
  });

  const existingSubmissionIndex = bidSubmissionRecords.findIndex(
    (candidate) => candidate.auctionId === input.auctionId,
  );

  if (existingSubmissionIndex >= 0) {
    bidSubmissionRecords[existingSubmissionIndex] = submission;
  } else {
    bidSubmissionRecords = [submission, ...bidSubmissionRecords];
    rawAuctionRecords[auctionIndex] = {
      ...auctionRecord,
      bidCount: auctionRecord.bidCount + 1,
    };
  }

  return submission.id;
}

export async function fetchDealerBidSuccess(
  submissionId: string,
): Promise<DealerBidSuccess> {
  await delay();

  const submission = bidSubmissionRecords.find(
    (candidate) => candidate.id === submissionId,
  );

  if (!submission) {
    throw new Error("입찰 완료 정보를 찾을 수 없습니다.");
  }

  const record = rawAuctionRecords.find(
    (candidate) => candidate.id === submission.auctionId,
  );

  if (!record) {
    throw new Error("경매를 찾을 수 없습니다.");
  }

  return dealerBidSuccessSchema.parse({
    auction: toAuctionDetail(record),
    submission,
  });
}
