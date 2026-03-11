import { z } from "zod";
import { dealerAuctionPurchaseMethodSchema } from "@/entities/auction/schemas/dealer-auction-brief-schema";

const dealerChatStageSchema = z.enum([
  "서류 확인",
  "계약 입력 대기",
  "출고 준비",
  "출고 완료",
]);

export const dealerChatMessageKindSchema = z.enum([
  "text",
  "image",
  "video",
  "file",
  "custom",
  "system",
]);

export const dealerChatAttachmentSchema = z.object({
  url: z.string(),
  fileName: z.string().nullable(),
  mimeType: z.string().nullable(),
  kind: z.enum(["image", "video", "file"]),
  thumbnailUrl: z.string().nullable(),
});

export const dealerChatCustomPayloadSchema = z.object({
  type: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  data: z.record(z.unknown()).nullable(),
});

export const dealerChatRoomListItemSchema = z.object({
  id: z.string(),
  dealId: z.string(),
  auctionId: z.string(),
  statusCode: z.string(),
  customerName: z.string(),
  customerPhone: z.string().nullable(),
  vehicleLabel: z.string(),
  stageLabel: dealerChatStageSchema,
  stageDescription: z.string(),
  lastMessage: z.string(),
  lastMessageAt: z.string().datetime(),
  unreadCount: z.number().int().nonnegative(),
  isClosed: z.boolean(),
});

export const dealerChatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderRole: z.enum(["dealer", "customer", "system"]),
  body: z.string(),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable().optional(),
  kind: dealerChatMessageKindSchema,
  attachment: dealerChatAttachmentSchema.nullable(),
  customPayload: dealerChatCustomPayloadSchema.nullable(),
  metadata: z.record(z.unknown()).nullable(),
});

export const dealerChatRoomSchema = dealerChatRoomListItemSchema.extend({
  purchaseMethod: dealerAuctionPurchaseMethodSchema,
  messages: dealerChatMessageSchema.array(),
});

export type DealerChatRoomListItem = z.infer<typeof dealerChatRoomListItemSchema>;
export type DealerChatMessage = z.infer<typeof dealerChatMessageSchema>;
export type DealerChatRoom = z.infer<typeof dealerChatRoomSchema>;
