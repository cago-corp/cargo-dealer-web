import type { DealerChatRoomListItem } from "@/entities/chat/schemas/dealer-chat-schema";

export function filterLiveChatRooms(
  rooms: DealerChatRoomListItem[] | undefined,
) {
  return (rooms ?? []).filter((room) => !room.isClosed);
}
