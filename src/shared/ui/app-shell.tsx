import Link from "next/link";
import type { DealerSession } from "@/shared/auth/auth-types";
import { appRoutes } from "@/shared/config/routes";
import { AppChatRail } from "@/shared/ui/app-chat-rail";
import { AppSidebarNav } from "@/shared/ui/app-sidebar-nav";
import { AppUtilityNav } from "@/shared/ui/app-utility-nav";
import { ChatRailProvider } from "@/shared/ui/chat-rail-provider";
import { SiteFooter } from "@/shared/ui/site-footer";

type AppShellProps = Readonly<{
  children: React.ReactNode;
  session: DealerSession;
}>;

export function AppShell({ children, session }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100/80">
      <header className="border-b border-slate-200 bg-white/96 backdrop-blur">
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
          <aside className="rounded-[32px] border border-white/70 bg-slate-950 px-5 py-6 text-white shadow-panel">
            <h1 className="text-2xl font-semibold">Dealer Center</h1>
            <p className="mt-3 text-sm text-slate-300">
              경매, 입찰, 거래 현황을 한 화면에서 빠르게 관리할 수 있습니다.
            </p>
            <AppSidebarNav />
          </aside>
          <ChatRailProvider>
            <main className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-panel backdrop-blur">
              <div className="px-6 py-6 md:px-8 md:py-8">
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
