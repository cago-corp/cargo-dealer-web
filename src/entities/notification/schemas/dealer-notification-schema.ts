import { z } from "zod";

const dealerNotificationTypeSchema = z.enum(["system", "chat", "auction"]);

const dealerNotificationTargetSchema = z.object({
  kind: z.enum([
    "none",
    "chat",
    "deal",
    "bid",
    "announcement",
    "announcement_info",
    "review",
    "interested_vehicle",
    "notification_settings",
    "terms",
    "customer_service",
  ]),
  value: z.string().nullable(),
});

export const dealerNotificationItemSchema = z.object({
  id: z.string(),
  type: dealerNotificationTypeSchema,
  title: z.string(),
  body: z.string(),
  createdAt: z.string().datetime(),
  isUnread: z.boolean(),
  highlighted: z.boolean(),
  target: dealerNotificationTargetSchema,
});

export type DealerNotificationItem = z.infer<typeof dealerNotificationItemSchema>;
export type DealerNotificationTarget = z.infer<typeof dealerNotificationTargetSchema>;
