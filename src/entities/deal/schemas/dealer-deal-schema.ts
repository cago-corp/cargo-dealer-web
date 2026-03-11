import { z } from "zod";
import { dealerAuctionPurchaseMethodSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";

const dealerDealStageSchema = z.enum([
  "서류 확인",
  "계약 입력 대기",
  "출고 준비",
  "출고 완료",
]);

const dealerDealStepStateSchema = z.enum(["completed", "current", "upcoming"]);

const dealerDealStepSchema = z.object({
  label: z.string(),
  state: dealerDealStepStateSchema,
});

const dealerDealServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const dealerDealListItemSchema = z.object({
  id: z.string(),
  auctionId: z.string(),
  chatRoomId: z.string(),
  customerName: z.string(),
  customerPhone: z.string().nullable(),
  vehicleLabel: z.string(),
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  stage: dealerDealStageSchema,
  statusDescription: z.string(),
  deliveryRegion: z.string(),
  updatedAt: z.string().datetime(),
});

export const dealerDealDetailSchema = dealerDealListItemSchema.extend({
  askingPriceLabel: z.string(),
  submittedAt: z.string().datetime(),
  contractMonths: z.number().int().positive().nullable(),
  advanceDownPaymentAmount: z.number().int().nonnegative().nullable(),
  depositDownPaymentAmount: z.number().int().nonnegative().nullable(),
  annualMileage: z.number().int().nonnegative().nullable(),
  customerType: z.string().nullable(),
  vehicleExteriorColorName: z.string().nullable(),
  vehicleInteriorColorName: z.string().nullable(),
  note: z.string(),
  services: dealerDealServiceSchema.array(),
  steps: dealerDealStepSchema.array(),
});

export type DealerDealStage = z.infer<typeof dealerDealStageSchema>;
export type DealerDealListItem = z.infer<typeof dealerDealListItemSchema>;
export type DealerDealDetail = z.infer<typeof dealerDealDetailSchema>;
export type DealerDealStep = z.infer<typeof dealerDealStepSchema>;
