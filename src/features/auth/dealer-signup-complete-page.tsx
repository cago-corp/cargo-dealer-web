"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealerSignupProgress } from "@/features/auth/components/dealer-signup-progress";
import { useDealerSignupDraft } from "@/features/auth/hooks/use-dealer-signup-draft";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

export function DealerSignupCompletePage() {
  const router = useRouter();
  const { clearDraft, draft } = useDealerSignupDraft();

  return (
    <DealerAuthScaffold>
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-panel">
          <p className="text-sm font-medium tracking-[0.2em] text-teal-300">
            가입 신청 완료
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">
            가입 신청이 접수되었습니다.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            관리자 승인 후 경매, 입찰, 거래 화면을 정상적으로 이용할 수 있습니다.
            심사 결과는 등록된 연락처 기준으로 안내됩니다.
          </p>
          <div className="mt-10">
            <DealerSignupProgress currentStep="complete" />
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-2xl text-white">
            ✓
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-950">
            접수 정보 확인
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <SummaryItem label="이메일" value={draft.email || "-"} />
            <SummaryItem label="이름" value={draft.name || "-"} />
            <SummaryItem label="닉네임" value={draft.nickname || "-"} />
            <SummaryItem label="연락처" value={draft.phone || "-"} />
            <SummaryItem label="업체명" value={draft.companyName || "-"} />
            <SummaryItem label="담당자명" value={draft.salespersonName || "-"} />
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              type="button"
              onClick={() => {
                clearDraft();
                router.replace(appRoutes.login());
                router.refresh();
              }}
            >
              로그인 화면으로
            </button>
            <Link
              className="rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
              href={appRoutes.signupCard()}
            >
              가입 정보 다시 보기
            </Link>
          </div>
        </div>
      </section>
    </DealerAuthScaffold>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}
