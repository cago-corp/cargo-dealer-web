type DealerSignupProgressStep = "terms" | "form" | "card" | "complete";

const signupSteps: Array<{
  id: DealerSignupProgressStep;
  title: string;
  description: string;
}> = [
  {
    id: "terms",
    title: "약관 동의",
    description: "필수 동의 항목 확인",
  },
  {
    id: "form",
    title: "기본 정보",
    description: "계정과 연락처 입력",
  },
  {
    id: "card",
    title: "업체 정보",
    description: "업체명과 명함 등록",
  },
  {
    id: "complete",
    title: "가입 접수",
    description: "관리자 검토 대기",
  },
] as const;

type DealerSignupProgressProps = {
  currentStep: DealerSignupProgressStep;
};

export function DealerSignupProgress({
  currentStep,
}: DealerSignupProgressProps) {
  const currentIndex = signupSteps.findIndex((step) => step.id === currentStep);

  return (
    <div className="space-y-4">
      {signupSteps.map((step, index) => {
        const isCurrent = step.id === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <div
            className={
              isCurrent
                ? "rounded-3xl border border-white/20 bg-white/10 px-5 py-4"
                : "rounded-3xl border border-white/10 bg-white/5 px-5 py-4"
            }
            key={step.id}
          >
            <div className="flex items-start gap-3">
              <div
                className={
                  isCurrent
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-teal-300 text-xs font-semibold text-slate-950"
                    : isCompleted
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-950"
                      : "flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-slate-300"
                }
              >
                {isCompleted ? "완료" : index + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-sm text-slate-300">{step.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
