"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";

type LogoutButtonProps = {
  variant?: "dark" | "light" | "ghost" | "text";
  className?: string;
};

export function LogoutButton({
  variant = "dark",
  className,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace(appRoutes.login());
      router.refresh();
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={
        variant === "light"
          ? `rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${className ?? ""}`.trim()
          : variant === "ghost"
            ? `bg-transparent px-1 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-200 ${className ?? ""}`.trim()
            : variant === "text"
              ? `bg-transparent px-0 py-0 text-sm font-medium text-slate-500 transition hover:text-rose-600 ${className ?? ""}`.trim()
          : `rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 ${className ?? ""}`.trim()
      }
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
