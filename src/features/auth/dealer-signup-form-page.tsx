"use client";

import type { InputHTMLAttributes } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DealerSignupProgress } from "@/features/auth/components/dealer-signup-progress";
import { useDealerSignupDraft } from "@/features/auth/hooks/use-dealer-signup-draft";
import { dealerSignupFormSchema } from "@/features/auth/schemas/dealer-signup-form-schema";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

type SignupFormField =
  | "email"
  | "password"
  | "passwordConfirm"
  | "name"
  | "nickname"
  | "phone";

export function DealerSignupFormPage() {
  const router = useRouter();
  const { draft, isHydrated, updateDraft } = useDealerSignupDraft();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignupFormField, string>>>(
    {},
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!draft.marketingAgreed || !draft.communityAgreed) {
      router.replace(appRoutes.signupTerms());
    }
  }, [draft.communityAgreed, draft.marketingAgreed, isHydrated, router]);

  function updateField(field: SignupFormField, value: string) {
    switch (field) {
      case "email":
        updateDraft({ email: value });
        break;
      case "password":
        updateDraft({ password: value });
        break;
      case "passwordConfirm":
        updateDraft({ passwordConfirm: value });
        break;
      case "name":
        updateDraft({ name: value });
        break;
      case "nickname":
        updateDraft({ nickname: value });
        break;
      case "phone":
        updateDraft({ phone: value });
        break;
      default:
        break;
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = dealerSignupFormSchema.safeParse({
      email: draft.email,
      name: draft.name,
      nickname: draft.nickname,
      password: draft.password,
      passwordConfirm: draft.passwordConfirm,
      phone: draft.phone,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<SignupFormField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field as SignupFormField]) {
          nextErrors[field as SignupFormField] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    router.push(appRoutes.signupCard());
  }

  return (
    <DealerAuthScaffold>
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-panel">
          <p className="text-sm font-medium tracking-[0.2em] text-teal-300">
            기본 정보 입력
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            로그인 정보와
            <br />
            판매자 정보를 입력합니다.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            가입에 필요한 필수 입력값을 한 화면에서 확인하고 바로 검증할 수 있습니다.
          </p>
          <div className="mt-10">
            <DealerSignupProgress currentStep="form" />
          </div>
        </div>

        <form
          className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur"
          onSubmit={handleSubmit}
        >
          <section>
            <h2 className="text-xl font-semibold text-slate-950">로그인 정보</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <SignupInput
                autoComplete="email"
                error={fieldErrors.email}
                label="이메일"
                placeholder="example@example.com"
                value={draft.email}
                onChange={(value) => updateField("email", value)}
              />
              <div className="hidden sm:block" />
              <SignupInput
                autoComplete="new-password"
                error={fieldErrors.password}
                label="비밀번호"
                placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                type="password"
                value={draft.password}
                onChange={(value) => updateField("password", value)}
              />
              <SignupInput
                autoComplete="new-password"
                error={fieldErrors.passwordConfirm}
                label="비밀번호 확인"
                type="password"
                value={draft.passwordConfirm}
                onChange={(value) => updateField("passwordConfirm", value)}
              />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-slate-950">판매자 정보</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <SignupInput
                autoComplete="name"
                error={fieldErrors.name}
                label="이름"
                value={draft.name}
                onChange={(value) => updateField("name", value)}
              />
              <SignupInput
                error={fieldErrors.nickname}
                label="닉네임"
                value={draft.nickname}
                onChange={(value) => updateField("nickname", value)}
              />
              <SignupInput
                autoComplete="tel"
                error={fieldErrors.phone}
                inputMode="numeric"
                label="연락처"
                placeholder="'-' 없이 숫자만 입력"
                value={draft.phone}
                onChange={(value) => updateField("phone", value)}
              />
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              className="rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
              href={appRoutes.signupTerms()}
            >
              이전 단계
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
                href={appRoutes.login()}
              >
                저장 후 나가기
              </Link>
              <button
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                type="submit"
              >
                다음
              </button>
            </div>
          </div>
        </form>
      </section>
    </DealerAuthScaffold>
  );
}

type SignupInputProps = {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "autoComplete" | "inputMode" | "placeholder" | "type"
>;

function SignupInput({
  error,
  label,
  onChange,
  value,
  ...inputProps
}: SignupInputProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...inputProps}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}
