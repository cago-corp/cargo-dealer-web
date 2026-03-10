"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ChatRailContextValue = {
  isCompactOpen: boolean;
  selectedRoomId: string | null;
  clearSelectedRoom: () => void;
  closeCompact: () => void;
  openCompact: () => void;
  openRoom: (roomId: string) => void;
  selectRoom: (roomId: string) => void;
  toggleCompact: () => void;
};

const ChatRailContext = createContext<ChatRailContextValue | null>(null);

type ChatRailProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export function ChatRailProvider({ children }: ChatRailProviderProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isCompactOpen, setIsCompactOpen] = useState(false);

  const closeCompact = useCallback(() => {
    setIsCompactOpen(false);
  }, []);

  const clearSelectedRoom = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  const openCompact = useCallback(() => {
    setIsCompactOpen(true);
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
  }, []);

  const openRoom = useCallback((roomId: string) => {
    setSelectedRoomId(roomId);
    setIsCompactOpen(true);
  }, []);

  const toggleCompact = useCallback(() => {
    setIsCompactOpen((current) => !current);
  }, []);

  const value = useMemo<ChatRailContextValue>(
    () => ({
      isCompactOpen,
      selectedRoomId,
      clearSelectedRoom,
      closeCompact,
      openCompact,
      openRoom,
      selectRoom,
      toggleCompact,
    }),
    [
      clearSelectedRoom,
      closeCompact,
      isCompactOpen,
      openCompact,
      openRoom,
      selectRoom,
      selectedRoomId,
      toggleCompact,
    ],
  );

  return <ChatRailContext.Provider value={value}>{children}</ChatRailContext.Provider>;
}

export function useChatRail() {
  const value = useContext(ChatRailContext);

  if (!value) {
    throw new Error("useChatRail must be used within ChatRailProvider.");
  }

  return value;
}
