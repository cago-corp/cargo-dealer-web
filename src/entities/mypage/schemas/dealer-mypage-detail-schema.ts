import { z } from "zod";

export const dealerMyInfoSchema = z.object({
  dealerName: z.string(),
  dealerNickname: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string(),
  recruiterRegistrationNumber: z.string().nullable(),
  approvalStatus: z.enum(["active", "pending"]),
  joinedAt: z.string().datetime(),
});

export const dealerNotificationSettingsSchema = z.object({
  serviceAlertEnabled: z.boolean(),
  marketingAlertEnabled: z.boolean(),
  browserPushEnabled: z.boolean(),
  browserPushStatusLabel: z.string(),
  quietHoursEnabled: z.boolean(),
  quietHoursRangeLabel: z.string(),
});

export const dealerInterestedVehicleSchema = z.object({
  id: z.string(),
  label: z.string(),
  modelDetail: z.string(),
  category: z.enum(["domestic", "imported"]),
  createdAt: z.string().datetime(),
});

export const dealerTermTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
});

export const dealerTermSchema = z.object({
  id: z.string(),
  typeId: z.string(),
  name: z.string(),
  content: z.string(),
});

export const dealerCustomerServiceChannelSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  availability: z.string(),
});

export const dealerCustomerServiceFaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const dealerCustomerServiceSchema = z.object({
  heroTitle: z.string(),
  heroDescription: z.string(),
  channels: dealerCustomerServiceChannelSchema.array(),
  faqs: dealerCustomerServiceFaqSchema.array(),
});

export const dealerReviewWorkspaceSchema = z.object({
  reviewCount: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  policySummary: z.string(),
  emptyStateTitle: z.string(),
  emptyStateDescription: z.string(),
});

export type DealerMyInfo = z.infer<typeof dealerMyInfoSchema>;
export type DealerNotificationSettings = z.infer<typeof dealerNotificationSettingsSchema>;
export type DealerInterestedVehicle = z.infer<typeof dealerInterestedVehicleSchema>;
export type DealerTermType = z.infer<typeof dealerTermTypeSchema>;
export type DealerTerm = z.infer<typeof dealerTermSchema>;
export type DealerCustomerService = z.infer<typeof dealerCustomerServiceSchema>;
export type DealerReviewWorkspace = z.infer<typeof dealerReviewWorkspaceSchema>;
