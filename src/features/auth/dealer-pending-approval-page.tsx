"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/shared/config/routes";
import { LogoutButton } from "@/shared/ui/logout-button";

type DealerPendingApprovalPageProps = {
  email: string;
};

export function DealerPendingApprovalPage({
  email,
}: DealerPendingApprovalPageProps) {
  const router = useRouter();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setFeedbackMessage(null);
    setIsRefreshing(true);

    try {
      const response = await fetch("/api/auth/refresh-session", { method: "POST" });
      const result = (await response.json().catch(() => null)) as
        | { message?: string; redirectTo?: string }
        | null;

      if (!response.ok) {
        setFeedbackMessage(
          result?.message ?? "승인 상태를 다시 확인하지 못했습니다.",
        );
        if (result?.redirectTo) {
          router.replace(result.redirectTo);
          router.refresh();
        }
        return;
      }

      if (result?.redirectTo && result.redirectTo !== appRoutes.pendingApproval()) {
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }

      setFeedbackMessage("아직 관리자 확인이 진행 중입니다.");
      router.refresh();
    } catch {
      setFeedbackMessage("승인 상태를 다시 확인하지 못했습니다.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[32px] border border-amber-200 bg-white px-8 py-10 shadow-panel">
        <p className="text-sm font-medium tracking-[0.2em] text-amber-700">
          가입 승인 대기
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          딜러 파트너 승인 절차가 진행 중입니다.
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          아래 두 단계가 모두 완료되면 경매장 홈과 거래 화면을 정상적으로 이용할 수
          있습니다.
        </p>

        <div className="mt-8 rounded-[28px] bg-amber-50 px-5 py-5">
          <p className="text-sm text-slate-500">확인용 계정</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{email}</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <StatusItem
            description="가입 신청이 접수되어 기본 정보 확인이 완료되었습니다."
            isCompleted
            title="가입 신청 접수"
          />
          <StatusItem
            description="업체 정보와 명함 확인이 끝나면 서비스 이용 권한이 열립니다."
            isCompleted={false}
            title="관리자 명함 확인"
          />
        </div>
      </div>

      <div className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-950">승인 상태 확인</p>
            <p className="mt-2 text-sm text-slate-500">
              승인 완료 시 다음 화면으로 자동 이동합니다.
            </p>
          </div>
          <button
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            {isRefreshing ? "확인 중..." : "새로고침"}
          </button>
        </div>

        {feedbackMessage ? (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {feedbackMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <LogoutButton variant="light" />
        </div>
      </div>
    </div>
  );
}

type StatusItemProps = {
  description: string;
  isCompleted: boolean;
  title: string;
};

function StatusItem({
  description,
  isCompleted,
  title,
}: StatusItemProps) {
  return (
    <div className="rounded-2xl border border-line bg-white px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-slate-950">{title}</p>
        <span
          className={
            isCompleted
              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
              : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
          }
        >
          {isCompleted ? "완료" : "대기 중"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
