import {
  fetchDealerChatRoomFromApi,
  fetchDealerChatRoomListFromApi,
} from "@/features/chat/lib/dealer-chat-api";

export const dealerChatRoomListQueryKey = ["dealer-chat-rooms"] as const;
export const dealerChatRoomQueryRoot = ["dealer-chat-room"] as const;

export function getDealerChatRoomQueryKey(roomId: string) {
  return [...dealerChatRoomQueryRoot, roomId] as const;
}

export {
  fetchDealerChatRoomFromApi as fetchDealerChatRoom,
  fetchDealerChatRoomListFromApi as fetchDealerChatRoomList,
};
