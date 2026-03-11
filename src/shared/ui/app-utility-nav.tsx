"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";

const utilityItems = [
  {
    href: appRoutes.favorites(),
    label: "찜한 차",
    matches: ["/favorites"],
    icon: HeartIcon,
  },
  {
    href: appRoutes.mypage(),
    label: "마이페이지",
    matches: ["/mypage"],
    icon: UserIcon,
  },
] as const;

type AppUtilityNavProps = {
  variant?: "topbar" | "panel";
};

export function AppUtilityNav({ variant = "topbar" }: AppUtilityNavProps) {
  const pathname = usePathname();
  const isTopbar = variant === "topbar";

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {utilityItems.map((item) => {
        const isActive = item.matches.some(
          (match) => pathname === match || pathname.startsWith(`${match}/`),
        );
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            className={
              isTopbar
                ? isActive
                  ? "inline-flex items-center gap-2 rounded-full border border-black/20 bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm"
                  : "inline-flex items-center gap-2 rounded-full border border-black/20 bg-black/75 px-3 py-2 text-sm font-medium text-white transition hover:bg-black"
                : isActive
                  ? "inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                  : "inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            }
            href={item.href}
          >
            <span
              className={
                isTopbar
                  ? isActive
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-white"
                    : "flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white"
                  : ""
              }
            >
              <Icon />
            </span>
            <span className={isTopbar ? "hidden sm:inline" : ""}>{item.label}</span>
          </Link>
        );
      })}
    </div>
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
