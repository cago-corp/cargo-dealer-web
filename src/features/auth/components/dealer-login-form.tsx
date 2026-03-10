"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dealerLoginSchema } from "@/features/auth/schemas/dealer-login-schema";
import { appRoutes } from "@/shared/config/routes";

export function DealerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = dealerLoginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorMessage("이메일 형식과 비밀번호 길이를 확인해주세요.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(
          result?.message ?? "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
        );
        return;
      }

      router.push(result?.redirectTo ?? appRoutes.dashboard());
      router.refresh();
    } catch {
      setErrorMessage("로그인 요청 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-accent"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {errorMessage ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </p>
      ) : null}
      <button
        className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "로그인 중..." : "딜러 워크스페이스 진입"}
      </button>
    </form>
  );
}
