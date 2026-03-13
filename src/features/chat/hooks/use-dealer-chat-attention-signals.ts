"use client";

import { useEffect, useMemo, useRef } from "react";
import type { DealerChatRoomListItem } from "@/entities/chat/schemas/dealer-chat-schema";
import {
  enableChatAudioOnInteraction,
  getUnreadChatCount,
  playIncomingChatSound,
  requestChatNotificationPermissionOnInteraction,
  showChatBrowserNotification,
  syncChatAttentionFavicon,
  syncChatAttentionTitle,
} from "@/features/chat/lib/chat-attention";

type UseDealerChatAttentionSignalsParams = {
  disabled?: boolean;
  rooms: DealerChatRoomListItem[];
  selectedRoomId: string | null;
  onOpenRoom: (roomId: string) => void;
};

export function useDealerChatAttentionSignals({
  disabled = false,
  rooms,
  selectedRoomId,
  onOpenRoom,
}: UseDealerChatAttentionSignalsParams) {
  const previousUnreadMapRef = useRef<Map<string, number> | null>(null);
  const totalUnreadCount = useMemo(() => getUnreadChatCount(rooms), [rooms]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const cleanupAudio = enableChatAudioOnInteraction();
    const cleanupNotificationPermission = requestChatNotificationPermissionOnInteraction();

    return () => {
      cleanupAudio();
      cleanupNotificationPermission();
    };
  }, [disabled]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    syncChatAttentionTitle(totalUnreadCount);
    syncChatAttentionFavicon(totalUnreadCount);
  }, [disabled, totalUnreadCount]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const nextUnreadMap = new Map(rooms.map((room) => [room.id, room.unreadCount]));

    if (!previousUnreadMapRef.current) {
      previousUnreadMapRef.current = nextUnreadMap;
      return;
    }

    const incomingRooms = rooms.filter((room) => {
      if (room.id === selectedRoomId) {
        return false;
      }

      const previousUnreadCount = previousUnreadMapRef.current?.get(room.id) ?? 0;
      return room.unreadCount > previousUnreadCount;
    });

    if (incomingRooms.length > 0) {
      void playIncomingChatSound();

      if (document.hidden) {
        const latestRoom = [...incomingRooms].sort(
          (left, right) =>
            Date.parse(right.lastMessageAt) - Date.parse(left.lastMessageAt),
        )[0];

        showChatBrowserNotification({
          roomId: latestRoom.id,
          title: `${latestRoom.customerName} · ${latestRoom.vehicleLabel}`,
          body: latestRoom.lastMessage,
          onClick: onOpenRoom,
        });
      }
    }

    previousUnreadMapRef.current = nextUnreadMap;
  }, [disabled, onOpenRoom, rooms, selectedRoomId]);

  return {
    totalUnreadCount,
  };
}
