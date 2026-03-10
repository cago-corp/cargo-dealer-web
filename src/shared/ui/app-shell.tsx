import type { DealerSession } from "@/shared/auth/auth-types";
import { AppChatRail } from "@/shared/ui/app-chat-rail";
import { AppSidebarNav } from "@/shared/ui/app-sidebar-nav";
import { LogoutButton } from "@/shared/ui/logout-button";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  session: DealerSession;
}>;

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1680px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        <aside className="rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-panel">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Cargo</p>
          <h1 className="mt-4 text-2xl font-semibold">Dealer Workspace</h1>
          <p className="mt-3 text-sm text-slate-300">
            Flutter dealer의 정보 구조를 웹 작업대에 맞게 재배치합니다. 채팅은
            우측 고정 레일에서 독립적으로 유지합니다.
          </p>
          <AppSidebarNav />
          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</p>
            <p className="mt-3 truncate text-sm font-medium text-slate-100">
              {session.email}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
              <span className="rounded-full bg-white/10 px-3 py-1">
                {session.backend}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                {session.approvalStatus === "active" ? "활성" : "승인 대기"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </aside>
        <main className="rounded-[32px] border border-white/70 bg-white/88 px-6 py-6 shadow-panel backdrop-blur md:px-8 md:py-8">
          {session.approvalStatus === "pending" ? (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              관리자 승인 전까지 일부 기능은 제한될 수 있습니다. Flutter dealer 앱의
              `pendingApproval` 상태를 웹에서도 같은 의미로 유지합니다.
            </div>
          ) : null}
          {children}
        </main>
        <AppChatRail />
      </div>
    </div>
  );
}
