import { getDealerDealStepIndex } from "@/features/deals/lib/dealer-deal-action";

const dealerDealStepLabels = ["계약금 입금", "차량 배정", "잔금 결제", "차량 출고"] as const;

type DealerDealStepperProps = {
  statusCode: string;
};

export function DealerDealStepper({ statusCode }: DealerDealStepperProps) {
  const currentStepIndex = getDealerDealStepIndex(statusCode);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {dealerDealStepLabels.map((label, index) => {
        const isCurrent = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;

        return (
          <div
            className={
              isCurrent
                ? "rounded-3xl border border-slate-950 bg-slate-950 px-4 py-4 text-white"
                : isCompleted
                  ? "rounded-3xl border border-teal-200 bg-teal-50 px-4 py-4 text-teal-900"
                  : "rounded-3xl border border-line bg-slate-50 px-4 py-4 text-slate-500"
            }
            key={label}
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  isCurrent
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950"
                    : isCompleted
                      ? "flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white"
                      : "flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-400"
                }
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">
                  Step {index + 1}
                </p>
                <p className="mt-1 text-base font-semibold">{label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
