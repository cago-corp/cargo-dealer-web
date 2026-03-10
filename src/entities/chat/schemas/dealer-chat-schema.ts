import { z } from "zod";

const dealerChatStageSchema = z.enum([
  "서류 확인",
  "계약 입력 대기",
  "출고 준비",
  "출고 완료",
]);

export const dealerChatRoomListItemSchema = z.object({
  id: z.string(),
  dealId: z.string(),
  auctionId: z.string(),
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
});

export const dealerChatRoomSchema = dealerChatRoomListItemSchema.extend({
  purchaseMethod: z.enum(["현금", "할부", "리스"]),
  messages: dealerChatMessageSchema.array(),
});

export type DealerChatRoomListItem = z.infer<typeof dealerChatRoomListItemSchema>;
export type DealerChatMessage = z.infer<typeof dealerChatMessageSchema>;
export type DealerChatRoom = z.infer<typeof dealerChatRoomSchema>;
