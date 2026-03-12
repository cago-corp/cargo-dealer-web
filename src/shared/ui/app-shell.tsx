import Link from "next/link";
import type { DealerSession } from "@/shared/auth/auth-types";
import { appRoutes } from "@/shared/config/routes";
import { AppChatRail } from "@/shared/ui/app-chat-rail";
import { AppSidebarNav } from "@/shared/ui/app-sidebar-nav";
import { AppUtilityNav } from "@/shared/ui/app-utility-nav";
import { ChatRailProvider } from "@/shared/ui/chat-rail-provider";
import { LogoutButton } from "@/shared/ui/logout-button";
import { SiteFooter } from "@/shared/ui/site-footer";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  session: DealerSession;
}>;

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      <header className="sticky top-0 z-40 border-b-2 border-violet-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between px-4 md:px-6">
          <Link
            className="text-base font-bold text-slate-950 transition hover:opacity-80"
            href={appRoutes.home()}
          >
            CARGO 딜러
          </Link>
          <AppUtilityNav variant="topbar" />
        </div>
      </header>
      <div className="flex-1 px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto grid h-full max-w-[1760px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_420px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 flex h-[calc(100vh-7.5rem)] min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-panel">
              <h1 className="text-2xl font-semibold">Dealer Center</h1>
              <p className="mt-3 text-sm text-slate-300">
                경매, 입찰, 거래 현황을 한 화면에서 빠르게 관리할 수 있습니다.
              </p>
              <AppSidebarNav />
              <div className="mt-auto pt-6">
                <LogoutButton variant="ghost" />
              </div>
            </div>
          </aside>
          <ChatRailProvider>
            <main className="overflow-visible rounded-none border-0 bg-transparent shadow-none backdrop-blur-0 lg:overflow-hidden lg:rounded-[32px] lg:border lg:border-white/80 lg:bg-white/92 lg:shadow-panel lg:backdrop-blur">
              <div className="px-0 py-0 md:px-0 md:py-0 lg:px-8 lg:py-8">
                {session.accessState !== "active" ? (
                  <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    관리자 승인 전까지 일부 기능이 제한될 수 있습니다.
                  </div>
                ) : null}
                {children}
              </div>
            </main>
            <AppChatRail />
          </ChatRailProvider>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
