"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerChatRoomListQueryKey,
  fetchDealerChatRoomList,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerChatRoomListQuery() {
  return useQuery({
    queryKey: dealerChatRoomListQueryKey,
    queryFn: fetchDealerChatRoomList,
    refetchInterval: 15_000,
  });
}
