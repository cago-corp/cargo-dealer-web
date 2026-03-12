"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";

const navigationItems = [
  {
    href: appRoutes.home(),
    label: "경매장 홈",
    matches: ["/home", "/home/auctions"],
  },
  {
    href: appRoutes.bids(),
    label: "내 입찰",
    matches: ["/bids", "/quote"],
  },
  {
    href: appRoutes.deals(),
    label: "내 거래",
    matches: ["/deals"],
  },
] as const;

type AppSidebarNavProps = {
  compact?: boolean;
};

export function AppSidebarNav({ compact = false }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={
        compact
          ? "flex gap-2 overflow-x-auto rounded-[22px] bg-slate-950 p-2 pb-2.5"
          : "mt-8 space-y-2"
      }
    >
      {navigationItems.map((item) => {
        const isActive = item.matches.some(
          (match) => pathname === match || pathname.startsWith(`${match}/`),
        );

        return (
          <Link
            key={item.href}
            className={
              compact
                ? isActive
                  ? "shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition"
                  : "shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/88 transition hover:bg-white/10"
                : isActive
                  ? "block rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition"
                  : "block rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
            }
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
