"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";

export function LogoutButton() {
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
      className="rounded-2xl border border-white/20 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
