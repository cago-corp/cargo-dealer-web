import type { DealerChatRoomListItem } from "@/entities/chat/schemas/dealer-chat-schema";

type DealerChatRoomListProps = {
  rooms: DealerChatRoomListItem[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

function formatRoomTimestamp(value: string) {
  const target = new Date(value);
  const current = new Date();
  const elapsedMilliseconds = current.getTime() - target.getTime();
  const elapsedMinutes = Math.floor(elapsedMilliseconds / (1000 * 60));
  const currentDate = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  );
  const targetDate = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const dayDifference = Math.floor(
    (currentDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (dayDifference === 0 && elapsedMinutes < 1) {
    return "방금 전";
  }

  if (dayDifference === 0 && elapsedMinutes < 60) {
    return `${elapsedMinutes}분 전`;
  }

  if (dayDifference === 0) {
    return `${Math.floor(elapsedMinutes / 60)}시간 전`;
  }

  if (dayDifference === 1) {
    return "어제";
  }

  return `${target.getMonth() + 1}/${target.getDate()}`;
}

export function DealerChatRoomList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  emptyTitle = "진행 중인 채팅이 없습니다.",
  emptyDescription = "현재 진행 중인 거래 대화만 이 영역에 표시됩니다.",
}: DealerChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-slate-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-slate-900">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rooms.map((room) => {
        const isActive = selectedRoomId === room.id;
        const initial = room.customerName.trim().charAt(0) || "고";

        return (
          <button
            key={room.id}
            className={
              isActive
                ? "flex w-full items-start gap-3 rounded-[28px] border border-slate-950 bg-slate-950 px-4 py-4 text-left text-white"
                : "flex w-full items-start gap-3 rounded-[28px] border border-line bg-white px-4 py-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            }
            type="button"
            onClick={() => onSelectRoom(room.id)}
          >
            <span
              className={
                isActive
                  ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-base font-semibold text-white"
                  : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-base font-semibold text-violet-700"
              }
            >
              {initial}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[15px] font-semibold">
                  {room.customerName}
                </span>
                <span
                  className={
                    isActive
                      ? "rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200"
                      : "rounded-full border border-line bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                  }
                >
                  {room.stageDescription}
                </span>
              </span>
              <span
                className={
                  isActive
                    ? "mt-1 block truncate text-sm text-slate-300"
                    : "mt-1 block truncate text-sm text-slate-500"
                }
              >
                {room.vehicleLabel}
              </span>
              <span
                className={
                  isActive
                    ? "mt-1.5 block truncate text-sm text-slate-200"
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
