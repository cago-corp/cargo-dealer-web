import { z } from "zod";
import { dealerAuctionBriefSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";

export const dealerAuctionStatusCodeSchema = z.enum(["경매중", "경매 종료"]);

export const dealerAuctionDetailSchema = dealerAuctionBriefSchema.extend({
  imageUrl: z.string().nullable(),
  brandLogoImageUrl: z.string().nullable(),
  viewCount: z.number().int().nonnegative(),
  bidCount: z.number().int().nonnegative(),
  fuelType: z.string(),
  statusCode: dealerAuctionStatusCodeSchema,
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
  myBidSubmissionId: z.string().nullable(),
});

export type DealerAuctionDetail = z.infer<typeof dealerAuctionDetailSchema>;
