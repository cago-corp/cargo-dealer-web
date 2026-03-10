import { SectionCard } from "@/shared/ui/section-card";

const roomItems = [
  { title: "현대 더 뉴 팰리세이드", state: "고객 대기" },
  { title: "벤츠 E-Class", state: "서류 검토" },
  { title: "기아 EV9", state: "조건 협의" },
] as const;

export function ChatWorkspacePreview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <SectionCard
        title="채팅 룸"
        description="full-page chat과 shell dock 중 어떤 모델로 갈지 결정하기 전의 중립 골격입니다."
      >
        <div className="space-y-3">
          {roomItems.map((room) => (
            <button
              key={room.title}
              className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-4 text-left"
              type="button"
            >
              <span>
                <span className="block font-medium text-slate-900">{room.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{room.state}</span>
              </span>
              <span className="text-sm text-teal-700">열기</span>
            </button>
          ))}
        </div>
      </SectionCard>
      <SectionCard
        title="대화 영역"
        description="실시간 연결 전에는 레이아웃과 shell-state 분리 원칙부터 고정합니다."
      >
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            고객과의 대화, 견적 맥락, 액션 버튼이 이 영역에 배치됩니다.
          </div>
          <div className="rounded-3xl bg-slate-950 p-4 text-sm text-slate-100">
            shell dock이 필요하다면 open/close 상태는 shell에 두고, room 데이터는
            `features/chat`에 둡니다.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
