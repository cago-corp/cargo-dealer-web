"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DealerSignupProgress } from "@/features/auth/components/dealer-signup-progress";
import { useDealerSignupDraft } from "@/features/auth/hooks/use-dealer-signup-draft";
import {
  dealerSignupCardSchema,
  dealerSignupFormSchema,
} from "@/features/auth/schemas/dealer-signup-form-schema";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

type SignupCardField =
  | "businessCardFileName"
  | "companyName"
  | "salespersonName";

export function DealerSignupCardPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { draft, isHydrated, updateDraft } = useDealerSignupDraft();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SignupCardField, string>>>(
    {},
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const formPrerequisite = dealerSignupFormSchema.safeParse({
      email: draft.email,
      name: draft.name,
      nickname: draft.nickname,
      password: draft.password,
      passwordConfirm: draft.passwordConfirm,
      phone: draft.phone,
    });

    if (!draft.marketingAgreed || !draft.communityAgreed) {
      router.replace(appRoutes.signupTerms());
      return;
    }

    if (!formPrerequisite.success) {
      router.replace(appRoutes.signupForm());
    }
  }, [draft, isHydrated, router]);

  function updateField(field: SignupCardField, value: string) {
    switch (field) {
      case "businessCardFileName":
        updateDraft({ businessCardFileName: value });
        break;
      case "companyName":
        updateDraft({ companyName: value });
        break;
      case "salespersonName":
        updateDraft({ salespersonName: value });
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

    const parsed = dealerSignupCardSchema.safeParse({
      businessCardFileName: draft.businessCardFileName,
      companyName: draft.companyName,
      salespersonName: draft.salespersonName,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<SignupCardField, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field as SignupCardField]) {
          nextErrors[field as SignupCardField] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    router.push(appRoutes.signupComplete());
  }

  return (
    <DealerAuthScaffold>
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-panel">
          <p className="text-sm font-medium tracking-[0.2em] text-teal-300">
            업체 정보 등록
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            심사에 필요한
            <br />
            업체 정보와 명함을 등록합니다.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            업체명, 담당자명, 명함 등록을 모두 채워야 가입 접수가 완료됩니다.
          </p>
          <div className="mt-10">
            <DealerSignupProgress currentStep="card" />
          </div>
        </div>

        <form
          className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">업체명</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950"
                value={draft.companyName}
                onChange={(event) => updateField("companyName", event.target.value)}
              />
              {fieldErrors.companyName ? (
                <p className="text-sm text-rose-600">{fieldErrors.companyName}</p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">담당자명</span>
              <input
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-950"
                value={draft.salespersonName}
                onChange={(event) =>
                  updateField("salespersonName", event.target.value)
                }
              />
              {fieldErrors.salespersonName ? (
                <p className="text-sm text-rose-600">
                  {fieldErrors.salespersonName}
                </p>
              ) : null}
            </label>
          </div>

          <div className="mt-8 rounded-[28px] border border-dashed border-line bg-slate-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-950">
                  명함 사진 첨부
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  관리자 확인용 명함 이미지를 등록합니다.
                </p>
              </div>
              <button
                className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                파일 선택
              </button>
            </div>

            <input
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                updateField("businessCardFileName", file?.name ?? "");
              }}
            />

            <div className="mt-5 rounded-2xl bg-white px-4 py-4">
              <p className="text-sm text-slate-500">첨부 상태</p>
              <p className="mt-2 text-sm font-medium text-slate-950">
                {draft.businessCardFileName || "아직 첨부된 명함이 없습니다."}
              </p>
            </div>

            {fieldErrors.businessCardFileName ? (
              <p className="mt-3 text-sm text-rose-600">
                {fieldErrors.businessCardFileName}
              </p>
            ) : null}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Link
              className="rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
              href={appRoutes.signupForm()}
            >
              이전 단계
            </Link>
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
              type="submit"
            >
              가입 신청 완료
            </button>
          </div>
        </form>
      </section>
    </DealerAuthScaffold>
  );
}
