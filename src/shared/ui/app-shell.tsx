import type { DealerSession } from "@/shared/auth/auth-types";
import { AppChatRail } from "@/shared/ui/app-chat-rail";
import { AppSidebarNav } from "@/shared/ui/app-sidebar-nav";
import { ChatRailProvider } from "@/shared/ui/chat-rail-provider";
import { LogoutButton } from "@/shared/ui/logout-button";
import { SiteFooter } from "@/shared/ui/site-footer";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  session: DealerSession;
}>;

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto grid h-full max-w-[1680px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="rounded-[32px] border border-violet-300/30 bg-gradient-to-b from-violet-700 to-violet-800 px-5 py-6 text-white shadow-panel">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Cargo</p>
            <h1 className="mt-4 text-2xl font-semibold">Dealer Center</h1>
            <p className="mt-3 text-sm text-violet-100/80">
              경매, 입찰, 거래 현황을 한 화면에서 빠르게 관리할 수 있습니다.
            </p>
            <AppSidebarNav />
            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-200/70">Session</p>
              <p className="mt-3 truncate text-sm font-medium text-slate-100">
                {session.email}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-violet-100/80">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {session.accessState === "active" ? "운영 가능" : "승인 대기"}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </aside>
          <ChatRailProvider>
            <main className="rounded-[32px] border border-white/80 bg-white/92 px-6 py-6 shadow-panel backdrop-blur md:px-8 md:py-8">
              {session.accessState !== "active" ? (
                <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  관리자 승인 전까지 일부 기능이 제한될 수 있습니다.
                </div>
              ) : null}
              {children}
            </main>
            <AppChatRail />
          </ChatRailProvider>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
