"use client";

import { useEffect } from "react";
import { DealerChatRoomList } from "@/features/chat/components/dealer-chat-room-list";
import { DealerChatRoomPanel } from "@/features/chat/components/dealer-chat-room-panel";
import { useDealerChatSyncStream } from "@/features/chat/hooks/use-dealer-chat-sync-stream";
import { filterLiveChatRooms } from "@/features/chat/lib/filter-live-chat-rooms";
import { useDealerChatRoomListQuery } from "@/features/chat/hooks/use-dealer-chat-room-list-query";
import { useChatRail } from "@/shared/ui/chat-rail-provider";
import { appRoutes } from "@/shared/config/routes";

function ChatRailContent() {
  const roomListQuery = useDealerChatRoomListQuery();
  const {
    clearSelectedRoom,
    isPoppedOutModule,
    markPoppedOutModule,
    selectedRoomId,
    selectRoom,
  } = useChatRail();
  const rooms = filterLiveChatRooms(roomListQuery.data);

  useDealerChatSyncStream(selectedRoomId);

  useEffect(() => {
    if (!selectedRoomId) {
      return;
    }

    const hasSelectedRoom = rooms.some((room) => room.id === selectedRoomId);

    if (!hasSelectedRoom) {
      clearSelectedRoom();
    }
  }, [clearSelectedRoom, rooms, selectedRoomId]);

  if (isPoppedOutModule) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Live Chat
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">실시간 채팅</h2>
          <div className="mt-5 rounded-[24px] border border-dashed border-violet-200 bg-violet-50 px-4 py-5">
            <p className="text-sm font-semibold text-violet-900">
              채팅 모듈이 새 창에서 열려 있습니다.
            </p>
            <p className="mt-2 text-sm leading-6 text-violet-700">
              목록과 상세 대화는 새 창에서 계속 사용할 수 있습니다. 창을 닫으면 여기로 다시 돌아옵니다.
            </p>
          </div>
        </div>
        <button
          className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={() =>
            window.open(
              appRoutes.chatWindow(selectedRoomId ?? undefined),
              "_blank",
              "popup=yes,width=1280,height=900,resizable=yes,scrollbars=yes",
            )
          }
        >
          새 창 다시 열기
        </button>
      </div>
    );
  }

  if (selectedRoomId) {
    return (
      <DealerChatRoomPanel
        mode="rail"
        roomId={selectedRoomId}
        onBack={clearSelectedRoom}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Live Chat
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            실시간 채팅
          </h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {rooms.length}건 진행 중
          </span>
          <button
            aria-label="새 창으로 보기"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            title="새 창으로 보기"
            type="button"
            onClick={() => {
              markPoppedOutModule();
              window.open(
                appRoutes.chatWindow(selectedRoomId ?? undefined),
                "_blank",
                "popup=yes,width=1280,height=900,resizable=yes,scrollbars=yes",
              );
            }}
          >
            <span>새 창</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5h5v5M19 5l-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
              <path
                d="M10 7H7.8A2.8 2.8 0 0 0 5 9.8v6.4A2.8 2.8 0 0 0 7.8 19h6.4a2.8 2.8 0 0 0 2.8-2.8V14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        현재 진행 중인 고객 대화를 바로 확인하고 필요한 메시지를 즉시 보낼 수 있습니다.
      </p>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
        {roomListQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                className="h-[106px] animate-pulse rounded-[28px] bg-slate-100"
                key={`chat-rail-skeleton-${index}`}
              />
            ))}
          </div>
        ) : roomListQuery.isError ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            채팅 목록을 불러오지 못했습니다.
          </p>
        ) : (
          <DealerChatRoomList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={selectRoom}
          />
        )}
      </div>
    </div>
  );
}

export function AppChatRail() {
  const { closeCompact, isCompactOpen, toggleCompact } = useChatRail();

  return (
    <>
      <aside className="hidden xl:block">
        <div className="sticky top-4 flex h-[calc(100vh-7.5rem)] min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-panel backdrop-blur">
          <ChatRailContent />
        </div>
      </aside>

      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 xl:hidden">
        {isCompactOpen ? (
          <section className="pointer-events-auto w-[320px] rounded-[28px] border border-slate-200/80 bg-white/96 p-4 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                  Live Chat
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                  채팅 열기
                </h2>
              </div>
              <button
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                type="button"
                onClick={closeCompact}
              >
                닫기
              </button>
            </div>
            <ChatRailContent />
          </section>
        ) : null}

        <button
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg"
          type="button"
          onClick={toggleCompact}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          채팅
        </button>
      </div>
    </>
  );
}
