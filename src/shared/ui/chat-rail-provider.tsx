"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CHAT_POPOUT_ACTIVE_STORAGE_KEY = "cargo-web:chat-popout-active";

type ChatRailContextValue = {
  isCompactOpen: boolean;
  isPoppedOutModule: boolean;
  selectedRoomId: string | null;
  clearSelectedRoom: () => void;
  closeCompact: () => void;
  releasePoppedOutModule: () => void;
  markPoppedOutModule: () => void;
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
  const [isPoppedOutModule, setIsPoppedOutModule] = useState(false);

  useEffect(() => {
    const nextValue = window.localStorage.getItem(CHAT_POPOUT_ACTIVE_STORAGE_KEY);
    setIsPoppedOutModule(nextValue === "true");

    function handleStorage(event: StorageEvent) {
      if (event.key !== CHAT_POPOUT_ACTIVE_STORAGE_KEY) {
        return;
      }

      setIsPoppedOutModule(event.newValue === "true");
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const closeCompact = useCallback(() => {
    setIsCompactOpen(false);
  }, []);

  const clearSelectedRoom = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  const openCompact = useCallback(() => {
    setIsCompactOpen(true);
  }, []);

  const markPoppedOutModule = useCallback(() => {
    window.localStorage.setItem(CHAT_POPOUT_ACTIVE_STORAGE_KEY, "true");
    setIsPoppedOutModule(true);
  }, []);

  const releasePoppedOutModule = useCallback(() => {
    window.localStorage.removeItem(CHAT_POPOUT_ACTIVE_STORAGE_KEY);
    setIsPoppedOutModule(false);
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
      isPoppedOutModule,
      selectedRoomId,
      clearSelectedRoom,
      closeCompact,
      releasePoppedOutModule,
      markPoppedOutModule,
      openCompact,
      openRoom,
      selectRoom,
      toggleCompact,
    }),
    [
      clearSelectedRoom,
      closeCompact,
      isCompactOpen,
      isPoppedOutModule,
      markPoppedOutModule,
      openCompact,
      openRoom,
      releasePoppedOutModule,
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
