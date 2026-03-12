"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactElement } from "react";
import { useDealerNotificationsQuery } from "@/features/mypage/hooks/use-dealer-notifications-query";
import { appRoutes } from "@/shared/config/routes";
import { LogoutButton } from "@/shared/ui/logout-button";

type UtilityItem = {
  href: string;
  label: string;
  matches: string[];
  excludeMatches?: string[];
  icon: () => ReactElement;
  showUnreadBadge?: boolean;
};

type DrawerItem = {
  href: string;
  label: string;
  matches: string[];
};

const utilityItems: UtilityItem[] = [
  {
    href: appRoutes.favorites(),
    label: "찜한 차",
    matches: ["/favorites"],
    icon: HeartIcon,
  },
  {
    href: appRoutes.mypageNotifications(),
    label: "알림",
    matches: ["/mypage/notifications"],
    icon: BellIcon,
    showUnreadBadge: true,
  },
  {
    href: appRoutes.mypage(),
    label: "마이페이지",
    matches: [
      "/mypage",
      "/mypage/my-info",
      "/mypage/review",
      "/mypage/interested-vehicles",
      "/mypage/notification-settings",
      "/mypage/terms",
      "/mypage/customer-service",
      "/mypage/announcements",
      "/mypage/archive",
    ],
    excludeMatches: ["/mypage/notifications"],
    icon: UserIcon,
  },
];

const mobileDrawerItems: DrawerItem[] = [
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
  {
    href: appRoutes.favorites(),
    label: "찜한 차",
    matches: ["/favorites"],
  },
  {
    href: appRoutes.mypage(),
    label: "마이페이지",
    matches: [
      "/mypage",
      "/mypage/my-info",
      "/mypage/review",
      "/mypage/interested-vehicles",
      "/mypage/notification-settings",
      "/mypage/terms",
      "/mypage/customer-service",
      "/mypage/announcements",
      "/mypage/archive",
    ],
  },
] as const;

type AppUtilityNavProps = {
  variant?: "topbar" | "panel";
};

export function AppUtilityNav({ variant = "topbar" }: AppUtilityNavProps) {
  const pathname = usePathname();
  const isTopbar = variant === "topbar";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const notificationsQuery = useDealerNotificationsQuery();
  const unreadNotificationCount = (notificationsQuery.data ?? []).filter(
    (item) => item.isUnread,
  ).length;

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  if (!isTopbar) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {utilityItems.map((item) => {
          const isExcluded =
            item.excludeMatches?.some(
              (match) => pathname === match || pathname.startsWith(`${match}/`),
            ) ?? false;
          const isActive =
            item.matches.some(
              (match) => pathname === match || pathname.startsWith(`${match}/`),
            ) && !isExcluded;
          const Icon = item.icon;
          const unreadCount = item.showUnreadBadge ? unreadNotificationCount : 0;

          return (
            <Link
              key={item.href}
              className={
                isActive
                  ? "inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                  : "inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              }
              href={item.href}
            >
              <span className="relative">
                <Icon />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-violet-700 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {Math.min(unreadCount, 9)}
                  </span>
                ) : null}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="hidden items-center gap-2 lg:flex">
        {utilityItems.map((item) => {
          const isExcluded =
            item.excludeMatches?.some(
              (match) => pathname === match || pathname.startsWith(`${match}/`),
            ) ?? false;
          const isActive =
            item.matches.some(
              (match) => pathname === match || pathname.startsWith(`${match}/`),
            ) && !isExcluded;
          const Icon = item.icon;
          const unreadCount = item.showUnreadBadge ? unreadNotificationCount : 0;

          return (
            <Link
              key={item.href}
              className={
                isActive
                  ? "inline-flex items-center gap-2 rounded-full border border-black/20 bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  : "inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/75 px-3 py-2 text-sm font-medium text-white transition hover:bg-black"
              }
              href={item.href}
            >
              <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                <Icon />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-violet-700 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {Math.min(unreadCount, 9)}
                  </span>
                ) : null}
              </span>
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <Link
          aria-label="알림"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-black text-white"
          href={appRoutes.mypageNotifications()}
        >
          <BellIcon />
          {unreadNotificationCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-violet-700 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
              {Math.min(unreadNotificationCount, 9)}
            </span>
          ) : null}
        </Link>

        <button
          aria-expanded={isDrawerOpen}
          aria-label="메뉴 열기"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-black text-white"
          type="button"
          onClick={() => setIsDrawerOpen(true)}
        >
          <HamburgerIcon />
        </button>
      </div>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-slate-950/45"
            type="button"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col border-l border-slate-200 bg-white px-5 pb-6 pt-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold text-slate-950">메뉴</p>
              <button
                aria-label="메뉴 닫기"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                type="button"
                onClick={() => setIsDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="mt-5 space-y-2">
              {mobileDrawerItems.map((item) => {
                const isActive = item.matches.some(
                  (match) => pathname === match || pathname.startsWith(`${match}/`),
                );

                return (
                  <Link
                    key={item.href}
                    className={
                      isActive
                        ? "block rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                        : "block rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    }
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-slate-200 pt-5">
              <LogoutButton className="text-base" variant="text" />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M9.5 20a2.5 2.5 0 0 0 5 0M5 17.5h14c-.8-.8-1.5-1.7-1.5-4.5a5.5 5.5 0 1 0-11 0c0 2.8-.7 3.7-1.5 4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 20.4 4.95 13.6a4.74 4.74 0 0 1 0-6.85 4.98 4.98 0 0 1 6.98 0L12 7.8l.07-.06a4.98 4.98 0 0 1 6.98 0 4.74 4.74 0 0 1 0 6.85L12 20.4Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
