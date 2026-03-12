"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDealerChatRoom,
  getDealerChatRoomQueryKey,
} from "@/features/chat/lib/dealer-chat-query";

export function useDealerChatRoomQuery(roomId: string | null) {
  return useQuery({
    queryKey: roomId ? getDealerChatRoomQueryKey(roomId) : ["dealer-chat-room", "empty"],
    queryFn: () => fetchDealerChatRoom(roomId ?? ""),
    enabled: Boolean(roomId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
