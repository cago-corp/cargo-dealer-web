import { z } from "zod";

export const dealerAnnouncementAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  sizeLabel: z.string(),
  url: z.string(),
});

export const dealerAnnouncementSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  viewCount: z.number().int().nonnegative(),
  isNew: z.boolean(),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
});

export const dealerAnnouncementDetailSchema = dealerAnnouncementSummarySchema.extend({
  attachments: dealerAnnouncementAttachmentSchema.array(),
});

export const dealerAnnouncementInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});

export const dealerAnnouncementPageSchema = z.object({
  items: dealerAnnouncementSummarySchema.array(),
  nextCursor: z.number().int().nullable(),
});

export type DealerAnnouncementAttachment = z.infer<
  typeof dealerAnnouncementAttachmentSchema
>;
export type DealerAnnouncementSummary = z.infer<typeof dealerAnnouncementSummarySchema>;
export type DealerAnnouncementDetail = z.infer<typeof dealerAnnouncementDetailSchema>;
export type DealerAnnouncementInfo = z.infer<typeof dealerAnnouncementInfoSchema>;
export type DealerAnnouncementPage = z.infer<typeof dealerAnnouncementPageSchema>;
