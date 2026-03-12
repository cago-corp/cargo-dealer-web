import { z } from "zod";
import { dealerAuctionDetailSchema } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { dealerAuctionPurchaseMethodSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";

export const dealerBidServiceOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const dealerBidCapitalOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const dealerBidSubmissionStateSchema = z.enum([
  "bidding",
  "contract_pending",
  "completed",
  "closed",
]);

export const dealerBidSubmissionSchema = z.object({
  id: z.string(),
  auctionId: z.string(),
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  monthlyPaymentValue: z.number().int().nonnegative().nullable(),
  discountAmountValue: z.number().int().nonnegative(),
  capitalId: z.string().nullable(),
  capitalName: z.string().nullable(),
  note: z.string(),
  currentRank: z.number().int().positive().nullable(),
  services: dealerBidServiceOptionSchema.array(),
  state: dealerBidSubmissionStateSchema,
  submittedAt: z.string().datetime(),
});

export const dealerBidListItemSchema = z.object({
  submissionId: z.string(),
  auctionId: z.string(),
  vehicleLabel: z.string(),
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  yearLabel: z.string(),
  fuelType: z.string(),
  bidCount: z.number().int().nonnegative(),
  deadlineAt: z.string().datetime(),
  statusLabel: z.string(),
  currentRank: z.number().int().positive().nullable(),
});

export const dealerBidDetailSchema = z.object({
  auction: dealerAuctionDetailSchema,
  submission: dealerBidSubmissionSchema,
  totalBidders: z.number().int().positive(),
});

export const dealerBidSuccessSchema = z.object({
  auction: dealerAuctionDetailSchema,
  submission: dealerBidSubmissionSchema,
});

export type DealerBidServiceOption = z.infer<typeof dealerBidServiceOptionSchema>;
export type DealerBidCapitalOption = z.infer<typeof dealerBidCapitalOptionSchema>;
export type DealerBidSubmission = z.infer<typeof dealerBidSubmissionSchema>;
export type DealerBidSubmissionState = z.infer<
  typeof dealerBidSubmissionStateSchema
>;
export type DealerBidListItem = z.infer<typeof dealerBidListItemSchema>;
export type DealerBidDetail = z.infer<typeof dealerBidDetailSchema>;
export type DealerBidSuccess = z.infer<typeof dealerBidSuccessSchema>;
