import { z } from "zod";

export const dealerAuctionBidStateSchema = z.enum([
  "open",
  "closing",
  "my_bid",
  "closed",
]);

export const dealerAuctionDealStageSchema = z.enum([
  "none",
  "서류 확인",
  "계약 입력 대기",
  "출고 준비",
]);

export const dealerAuctionPurchaseMethodSchema = z.enum(["현금", "할부", "리스"]);

export const dealerAuctionBriefSchema = z.object({
  id: z.string(),
  sellerName: z.string(),
  brandName: z.string(),
  modelName: z.string(),
  trimName: z.string(),
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  regionLabel: z.string(),
  isFavorited: z.boolean(),
  isImported: z.boolean(),
  openedAt: z.string().datetime(),
  deadlineAt: z.string().datetime(),
  yearLabel: z.string(),
  mileageLabel: z.string(),
  askingPriceValue: z.number().int().positive(),
  askingPriceLabel: z.string(),
  viewCount: z.number().int().nonnegative(),
  bidCount: z.number().int().nonnegative(),
  bidState: dealerAuctionBidStateSchema,
  statusLabel: z.string(),
  dealStage: dealerAuctionDealStageSchema,
});

export type DealerAuctionBrief = z.infer<typeof dealerAuctionBriefSchema>;
