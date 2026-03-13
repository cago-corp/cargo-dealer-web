"use client";

import type { DealerChatRoomListItem } from "@/entities/chat/schemas/dealer-chat-schema";

const DEFAULT_TITLE = "카고 딜러";
const FAVICON_ELEMENT_ID = "cargo-chat-favicon";
const AUDIO_THROTTLE_MS = 800;

let audioContext: AudioContext | null = null;
let lastSoundPlayedAt = 0;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextCtor();
  }

  return audioContext;
}

export function enableChatAudioOnInteraction() {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const unlockAudio = () => {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    void context.resume().catch(() => undefined);
  };

  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio);

  return () => {
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
}

export async function playIncomingChatSound() {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();

  if (now - lastSoundPlayedAt < AUDIO_THROTTLE_MS) {
    return;
  }

  const context = getAudioContext();

  if (!context) {
    return;
  }

  lastSoundPlayedAt = now;

  try {
    if (context.state === "suspended") {
      await context.resume();
    }

    const startAt = context.currentTime;
    const gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.12, startAt + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22);

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(1174, startAt + 0.16);
    oscillator.connect(gainNode);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.24);
  } catch {
    // Browsers can still reject audio playback until a trusted interaction occurs.
  }
}

function getBaseTitle() {
  if (typeof document === "undefined") {
    return DEFAULT_TITLE;
  }

  const currentTitle =
    document.documentElement.dataset.chatBaseTitle || document.title || DEFAULT_TITLE;

  if (currentTitle === "Cargo Dealer Web" || currentTitle === "CARGO 딜러") {
    return DEFAULT_TITLE;
  }

  return currentTitle;
}

export function syncChatAttentionTitle(totalUnreadCount: number) {
  if (typeof document === "undefined") {
    return;
  }

  const baseTitle = getBaseTitle();
  document.documentElement.dataset.chatBaseTitle = baseTitle;
  document.title =
    totalUnreadCount > 0 ? `(${totalUnreadCount}) ${baseTitle}` : baseTitle;
}

function getOrCreateFaviconElement() {
  if (typeof document === "undefined") {
    return null;
  }

  const existing =
    document.getElementById(FAVICON_ELEMENT_ID) as HTMLLinkElement | null;

  if (existing) {
    return existing;
  }

  const favicon = document.createElement("link");
  favicon.id = FAVICON_ELEMENT_ID;
  favicon.rel = "icon";
  document.head.appendChild(favicon);

  return favicon;
}

function buildChatFaviconDataUrl(showUnreadDot: boolean) {
  const dotMarkup = showUnreadDot
    ? '<circle cx="51" cy="13" r="9" fill="#ef4444" stroke="#ffffff" stroke-width="4" />'
    : "";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="18" fill="#0f172a" />
      <text
        x="32"
        y="39"
        text-anchor="middle"
        font-family="Pretendard, system-ui, sans-serif"
        font-size="28"
        font-weight="700"
        fill="#ffffff"
      >
        C
      </text>
      ${dotMarkup}
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function syncChatAttentionFavicon(totalUnreadCount: number) {
  const favicon = getOrCreateFaviconElement();

  if (!favicon) {
    return;
  }

  favicon.href = buildChatFaviconDataUrl(totalUnreadCount > 0);
}

export function requestChatNotificationPermissionOnInteraction() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return () => undefined;
  }

  if (Notification.permission !== "default") {
    return () => undefined;
  }

  const requestPermission = () => {
    if (Notification.permission !== "default") {
      return;
    }

    void Notification.requestPermission().catch(() => undefined);
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener("pointerdown", requestPermission);
    window.removeEventListener("keydown", requestPermission);
  };

  window.addEventListener("pointerdown", requestPermission, { passive: true });
  window.addEventListener("keydown", requestPermission);

  return cleanup;
}

type ChatBrowserNotificationPayload = {
  roomId: string;
  title: string;
  body: string;
  onClick?: (roomId: string) => void;
};

export function showChatBrowserNotification({
  roomId,
  title,
  body,
  onClick,
}: ChatBrowserNotificationPayload) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const notification = new Notification(title, {
    body,
    tag: `dealer-chat-room:${roomId}`,
    silent: true,
  });

  notification.onclick = () => {
    window.focus();
    onClick?.(roomId);
    notification.close();
  };
}

export function getUnreadChatCount(rooms: DealerChatRoomListItem[]) {
  return rooms.reduce((total, room) => total + room.unreadCount, 0);
}
