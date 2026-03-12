import { z } from "zod";

export const dealerContractOptionItemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const dealerContractInitDataSchema = z.object({
  exteriorColors: dealerContractOptionItemSchema.array(),
  interiorColors: dealerContractOptionItemSchema.array(),
  serviceItems: dealerContractOptionItemSchema.array(),
});

export const dealerContractSubmitSchema = z.object({
  finalVehiclePrice: z.number().int().positive(),
  finalDiscountAmount: z.number().int().nonnegative(),
  purchaseMethod: z.enum(["현금", "할부", "리스", "장기렌트"]),
  region: z.string().trim().min(1),
  exteriorColorId: z.string().trim().min(1),
  interiorColorId: z.string().trim().min(1),
  optionTypeIds: z.string().array().default([]),
  monthlyPayment: z.number().int().positive().nullable().optional(),
  contractMonths: z.number().int().positive().nullable().optional(),
  annualMileage: z.number().int().positive().nullable().optional(),
  customerType: z.enum(["개인", "개인사업자", "법인"]).nullable().optional(),
  advancePercent: z.number().int().min(0).max(100).nullable().optional(),
  advanceAmount: z.number().int().nonnegative().nullable().optional(),
  depositPercent: z.number().int().min(0).max(100).nullable().optional(),
  depositAmount: z.number().int().nonnegative().nullable().optional(),
});

export type DealerContractOptionItem = z.infer<typeof dealerContractOptionItemSchema>;
export type DealerContractInitData = z.infer<typeof dealerContractInitDataSchema>;
export type DealerContractSubmitPayload = z.infer<typeof dealerContractSubmitSchema>;
