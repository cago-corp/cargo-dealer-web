"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dealerLoginSchema } from "@/features/auth/schemas/dealer-login-schema";
import { appRoutes } from "@/shared/config/routes";

export function DealerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
      const nextPath = searchParams.get("next");
      const loginUrl = nextPath
        ? `/api/auth/login?next=${encodeURIComponent(nextPath)}`
        : "/api/auth/login";
      const response = await fetch(loginUrl, {
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

      router.push(result?.redirectTo ?? appRoutes.home());
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
        <div className="relative">
          <input
            id="password"
            className="w-full rounded-2xl border border-line bg-white px-4 py-3 pr-12 outline-none transition focus:border-accent"
            name="password"
            type={isPasswordVisible ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-700"
            type="button"
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
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
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 3 21 21"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M10.6 5.2A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3M6.1 6.1C3.6 7.8 2 12 2 12a17.8 17.8 0 0 0 6.3 5.4A10.4 10.4 0 0 0 12 19c1.3 0 2.5-.2 3.6-.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
