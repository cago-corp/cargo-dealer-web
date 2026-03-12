"use client";

import { useRouter } from "next/navigation";
import { DealerSignupProgress } from "@/features/auth/components/dealer-signup-progress";
import { useDealerSignupDraft } from "@/features/auth/hooks/use-dealer-signup-draft";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

const requiredTerms = [
  {
    key: "marketingAgreed",
    title: "[필수] 마케팅 활용 정보 동의",
    description: "가입 심사 안내, 서비스 공지, 운영 연락 수신에 사용됩니다.",
  },
  {
    key: "communityAgreed",
    title: "[필수] 커뮤니티 이용 규칙 동의",
    description: "딜러 활동 정책과 서비스 이용 기준을 확인합니다.",
  },
] as const;

export function DealerSignupTermsPage() {
  const router = useRouter();
  const { draft, updateDraft } = useDealerSignupDraft();
  const isAllChecked = draft.marketingAgreed && draft.communityAgreed;

  function toggleRequiredTerm(
    key: (typeof requiredTerms)[number]["key"],
    checked: boolean,
  ) {
    if (key === "marketingAgreed") {
      updateDraft({ marketingAgreed: checked });
      return;
    }

    updateDraft({ communityAgreed: checked });
  }

  return (
    <DealerAuthScaffold>
      <section className="grid w-full gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-panel">
          <p className="text-sm font-medium tracking-[0.2em] text-teal-300">
            딜러 회원가입
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            가입을 시작하기 전에
            <br />
            필수 약관 동의를 먼저 확인합니다.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            약관 동의 후 기본 정보, 업체 정보, 명함 등록 순서로 가입을 진행합니다.
          </p>
          <div className="mt-10">
            <DealerSignupProgress currentStep="terms" />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
          <div className="rounded-[28px] bg-slate-50 p-5">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                checked={isAllChecked}
                className="mt-1 h-5 w-5 rounded border-line text-slate-950"
                type="checkbox"
                onChange={(event) => {
                  updateDraft({
                    communityAgreed: event.target.checked,
                    marketingAgreed: event.target.checked,
                  });
                }}
              />
              <div>
                <p className="text-base font-semibold text-slate-950">전체 동의</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  필수 약관에 모두 동의하면 다음 단계로 진행할 수 있습니다.
                </p>
              </div>
            </label>
          </div>

          <div className="mt-6 space-y-4">
            {requiredTerms.map((term) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-[28px] border border-line bg-white px-5 py-5"
                key={term.key}
              >
                <input
                  checked={draft[term.key]}
                  className="mt-1 h-5 w-5 rounded border-line text-slate-950"
                  type="checkbox"
                  onChange={(event) => toggleRequiredTerm(term.key, event.target.checked)}
                />
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    {term.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {term.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
              disabled={!isAllChecked}
              onClick={() => {
                router.push(appRoutes.signupForm());
              }}
            >
              다음
            </button>
            <button
              className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
              type="button"
              onClick={() => {
                router.push(appRoutes.login());
              }}
            >
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </section>
    </DealerAuthScaffold>
  );
}
