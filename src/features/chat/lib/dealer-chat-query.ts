import {
  fetchDealerChatRoom,
  fetchDealerChatRoomList,
} from "@/shared/api/dealer-marketplace";

export const dealerChatRoomListQueryKey = ["dealer-chat-rooms"] as const;
export const dealerChatRoomQueryRoot = ["dealer-chat-room"] as const;

export function getDealerChatRoomQueryKey(roomId: string) {
  return [...dealerChatRoomQueryRoot, roomId] as const;
}

export {
  fetchDealerChatRoom,
  fetchDealerChatRoomList,
};
