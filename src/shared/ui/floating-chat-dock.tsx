"use client";

import Link from "next/link";
import { useState } from "react";
import { appRoutes } from "@/shared/config/routes";

const previewRooms = [
  { title: "현대 더 뉴 팰리세이드", state: "고객 응답 대기" },
  { title: "벤츠 E-Class", state: "서류 확인 중" },
  { title: "기아 EV9", state: "입찰가 정리" },
] as const;

export function FloatingChatDock() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3">
      {isOpen ? (
        <section className="pointer-events-auto w-[320px] rounded-[28px] border border-slate-200/80 bg-white/96 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
                Floating Chat
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">
                우측 고정 채팅 도크
              </h2>
            </div>
            <button
              className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              접기
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            shell은 open/close만 소유하고, 실제 채팅 데이터는 `features/chat`에서
            이어받는 구조를 전제로 둡니다.
          </p>
          <div className="mt-4 space-y-2">
            {previewRooms.map((room) => (
              <button
                key={room.title}
                className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left"
                type="button"
              >
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    {room.title}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">{room.state}</span>
                </span>
                <span className="text-xs font-medium text-teal-700">열기</span>
              </button>
            ))}
          </div>
          <Link
            className="mt-4 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
            href={appRoutes.chat()}
          >
            전체 채팅 페이지 열기
          </Link>
        </section>
      ) : null}
      <button
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-lg"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        {isOpen ? "채팅 도크" : "채팅 열기"}
      </button>
    </div>
  );
}
