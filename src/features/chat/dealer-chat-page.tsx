import { ChatWorkspacePreview } from "@/features/chat/components/chat-workspace-preview";

export function DealerChatPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Chat
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">딜러 채팅 작업 영역</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Flutter 채팅 기능을 그대로 옮기지 않고, 웹 shell과 페이지 UX 중 어떤
          방향이 맞는지 검토할 수 있는 중립 골격입니다.
        </p>
      </header>
      <ChatWorkspacePreview />
    </section>
  );
}
