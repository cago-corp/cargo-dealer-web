import type { DealerChatRoomListItem } from "@/entities/chat/schemas/dealer-chat-schema";

type DealerChatRoomListProps = {
  rooms: DealerChatRoomListItem[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
};

function formatRoomTimestamp(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function DealerChatRoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: DealerChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-slate-900">진행 중인 채팅이 없습니다.</p>
        <p className="mt-2 text-sm text-slate-500">
          거래가 시작되면 고객과의 대화가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const isActive = selectedRoomId === room.id;

        return (
          <button
            key={room.id}
            className={
              isActive
                ? "flex w-full items-start justify-between rounded-[28px] border border-slate-950 bg-slate-950 px-4 py-4 text-left text-white"
                : "flex w-full items-start justify-between rounded-[28px] border border-line bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            }
            type="button"
            onClick={() => onSelectRoom(room.id)}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-base font-semibold">
                  {room.customerName}
                </span>
                <span
                  className={
                    isActive
                      ? "rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                      : "rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  }
                >
                  {room.stageLabel}
                </span>
              </span>
              <span
                className={
                  isActive
                    ? "mt-2 block truncate text-sm text-slate-300"
                    : "mt-2 block truncate text-sm text-slate-500"
                }
              >
                {room.vehicleLabel}
              </span>
              <span
                className={
                  isActive
                    ? "mt-2 block truncate text-sm text-slate-200"
                    : "mt-2 block truncate text-sm text-slate-600"
                }
              >
                {room.lastMessage}
              </span>
            </span>

            <span className="ml-4 flex shrink-0 flex-col items-end gap-2">
              <span
                className={
                  isActive ? "text-xs text-slate-300" : "text-xs text-slate-500"
                }
              >
                {formatRoomTimestamp(room.lastMessageAt)}
              </span>
              {room.unreadCount > 0 ? (
                <span className="rounded-full bg-teal-500 px-2 py-1 text-[11px] font-semibold text-white">
                  {room.unreadCount}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
