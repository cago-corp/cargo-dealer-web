"use client";

import { DealerChatRoomList } from "@/features/chat/components/dealer-chat-room-list";
import { DealerChatRoomPanel } from "@/features/chat/components/dealer-chat-room-panel";
import { useDealerChatRoomListQuery } from "@/features/chat/hooks/use-dealer-chat-room-list-query";
import { useChatRail } from "@/shared/ui/chat-rail-provider";

function ChatRailContent() {
  const roomListQuery = useDealerChatRoomListQuery();
  const { clearSelectedRoom, selectedRoomId, selectRoom } = useChatRail();
  const rooms = roomListQuery.data;

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
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Live Chat
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            실시간 채팅
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {(rooms ?? []).length}건 진행 중
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        현재 진행 중인 고객 대화를 바로 확인하고 필요한 메시지를 즉시 보낼 수 있습니다.
      </p>

      <div className="mt-5 space-y-4">
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
            rooms={rooms ?? []}
            selectedRoomId={selectedRoomId}
            onSelectRoom={selectRoom}
          />
        )}
      </div>
    </>
  );
}

export function AppChatRail() {
  const { closeCompact, isCompactOpen, toggleCompact } = useChatRail();

  return (
    <>
      <aside className="hidden xl:block">
        <div className="sticky top-4 rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-panel backdrop-blur">
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
