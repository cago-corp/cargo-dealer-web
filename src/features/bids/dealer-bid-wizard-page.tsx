"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { DealerAuctionDetail } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { dealerBidWizardSubmitSchema } from "@/features/bids/schemas/dealer-bid-wizard-submit-schema";
import { dealerBidListQueryKey, dealerBidDetailQueryRoot } from "@/features/bids/lib/dealer-bid-query";
import { useDealerAuctionDetailQuery } from "@/features/home/hooks/use-dealer-auction-detail-query";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import {
  listDealerBidCapitalOptions,
  listDealerBidServiceOptions,
  submitDealerBid,
} from "@/shared/api/dealer-marketplace";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type DealerBidWizardPageProps = {
  auctionId: string;
};

type BidWizardStep = "service" | "monthly" | "discount" | "capital";

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function buildBidWizardSteps(
  purchaseMethod: DealerAuctionDetail["purchaseMethod"],
): BidWizardStep[] {
  if (purchaseMethod === "현금") {
    return ["service", "discount"];
  }

  if (purchaseMethod === "할부") {
    return ["service", "monthly", "discount"];
  }

  return ["service", "monthly", "capital"];
}

export function DealerBidWizardPage({
  auctionId,
}: DealerBidWizardPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const auctionDetailQuery = useDealerAuctionDetailQuery(auctionId);
  const serviceOptions = useMemo(() => listDealerBidServiceOptions(), []);
  const capitalOptions = useMemo(() => listDealerBidCapitalOptions(), []);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [capitalId, setCapitalId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: submitDealerBid,
    onSuccess: (submissionId) => {
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: dealerBidListQueryKey });
      queryClient.invalidateQueries({ queryKey: dealerBidDetailQueryRoot });
      router.push(appRoutes.bidSuccess(submissionId));
    },
    onError: () => {
      setErrorMessage("입찰 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    },
  });

  if (auctionDetailQuery.isLoading) {
    return (
      <SectionCard title="입찰하기" description="경매 정보를 불러오는 중입니다.">
        <div className="h-[320px] animate-pulse rounded-[28px] bg-slate-100" />
      </SectionCard>
    );
  }

  if (auctionDetailQuery.isError || !auctionDetailQuery.data) {
    return (
      <SectionCard title="입찰하기" description="경매 정보를 불러오지 못했습니다.">
        <p className="text-sm text-rose-600">잠시 후 다시 시도해 주세요.</p>
      </SectionCard>
    );
  }

  const auction = auctionDetailQuery.data;
  const steps = buildBidWizardSteps(auction.purchaseMethod);
  const currentStep = steps[currentStepIndex];

  function validateCurrentStep() {
    if (currentStep === "monthly") {
      const monthlyPaymentValue = Number(monthlyPayment);

      if (!monthlyPayment || Number.isNaN(monthlyPaymentValue) || monthlyPaymentValue < 100000) {
        return "월 납입료는 최소 10만원 이상이어야 합니다.";
      }
    }

    if (currentStep === "discount") {
      const discountAmountValue = Number(discountAmount);

      if (!discountAmount || Number.isNaN(discountAmountValue) || discountAmountValue <= 0) {
        return "할인 금액을 입력해주세요.";
      }
    }

    if (currentStep === "capital" && !capitalId) {
      return "캐피탈사를 선택해주세요.";
    }

    return null;
  }

  function handleProceed() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((value) => value + 1);
      return;
    }

    const parsed = dealerBidWizardSubmitSchema.safeParse({
      selectedServiceIds,
      note,
      monthlyPaymentValue:
        auction.purchaseMethod === "현금" ? null : Number(monthlyPayment || 0),
      discountAmountValue: Number(discountAmount || 0),
      capitalId,
    });

    if (!parsed.success) {
      setErrorMessage("입찰 폼을 다시 확인해주세요.");
      return;
    }

    submitMutation.mutate({
      auctionId: auction.id,
      purchaseMethod: auction.purchaseMethod,
      ...parsed.data,
    });
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Bid Wizard
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">입찰하기</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          구매 방식에 따라 필요한 항목만 순서대로 입력해 입찰을 제출할 수 있습니다.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <SectionCard
          title={`STEP ${currentStepIndex + 1} / ${steps.length}`}
          description={stepDescription(currentStep)}
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <span
                className={
                  index === currentStepIndex
                    ? "rounded-full bg-slate-950 px-3 py-1 text-sm font-semibold text-white"
                    : "rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500"
                }
                key={step}
              >
                {stepLabel(step)}
              </span>
            ))}
          </div>

          {currentStep === "service" ? (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-2">
                {serviceOptions.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);

                  return (
                    <button
                      className={
                        isSelected
                          ? "rounded-3xl border border-slate-950 bg-slate-950 p-5 text-left text-white"
                          : "rounded-3xl border border-line bg-white p-5 text-left"
                      }
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceIds((current) =>
                          isSelected
                            ? current.filter((serviceId) => serviceId !== service.id)
                            : [...current, service.id],
                        );
                      }}
                    >
                      <p className="text-base font-semibold">{service.name}</p>
                      <p
                        className={
                          isSelected
                            ? "mt-2 text-sm text-slate-300"
                            : "mt-2 text-sm text-slate-500"
                        }
                      >
                        {service.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">메모</span>
                <textarea
                  className="min-h-32 w-full rounded-3xl border border-line px-4 py-4 outline-none"
                  placeholder="고객에게 전달할 특약이나 출고 메모를 입력하세요."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </label>
            </div>
          ) : null}

          {currentStep === "monthly" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">월 납입료</span>
              <input
                className="w-full rounded-3xl border border-line px-4 py-4 text-lg outline-none"
                min={100000}
                step={10000}
                type="number"
                value={monthlyPayment}
                onChange={(event) => setMonthlyPayment(event.target.value)}
              />
              <p className="text-sm text-slate-500">
                최소 100,000원 이상 입력합니다.
              </p>
            </label>
          ) : null}

          {currentStep === "discount" ? (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">할인 금액</span>
              <input
                className="w-full rounded-3xl border border-line px-4 py-4 text-lg outline-none"
                min={0}
                step={100000}
                type="number"
                value={discountAmount}
                onChange={(event) => setDiscountAmount(event.target.value)}
              />
              <p className="text-sm text-slate-500">
                현금/할부 제안 시 고객에게 제시할 할인 금액입니다.
              </p>
            </label>
          ) : null}

          {currentStep === "capital" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {capitalOptions.map((capital) => (
                <button
                  className={
                    capitalId === capital.id
                      ? "rounded-3xl border border-slate-950 bg-slate-950 p-5 text-left text-white"
                      : "rounded-3xl border border-line bg-white p-5 text-left"
                  }
                  key={capital.id}
                  type="button"
                  onClick={() => setCapitalId(capital.id)}
                >
                  <p className="text-base font-semibold">{capital.name}</p>
                </button>
              ))}
            </div>
          ) : null}

          {errorMessage ? (
            <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button
              className="rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
              disabled={currentStepIndex === 0}
              type="button"
              onClick={() => setCurrentStepIndex((value) => Math.max(value - 1, 0))}
            >
              이전
            </button>
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              disabled={submitMutation.isPending}
              type="button"
              onClick={handleProceed}
            >
              {currentStepIndex === steps.length - 1
                ? submitMutation.isPending
                  ? "제출 중..."
                  : "입찰 완료"
                : "다음"}
            </button>
          </div>
        </SectionCard>

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="입찰 요약"
            description="현재 경매와 입력 중인 제안 조건을 우측에서 계속 확인합니다."
          >
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Vehicle
                </p>
                <p className="mt-2 text-base font-semibold text-slate-950">
                  {auction.brandName} {auction.modelName} {auction.trimName}
                </p>
              </div>
              <SummaryRow label="구매 방식" value={auction.purchaseMethod} />
              <SummaryRow
                label="차량가"
                value={`${formatWon(auction.askingPriceValue)}원`}
              />
              <SummaryRow
                label="선택 서비스"
                value={
                  selectedServiceIds.length === 0
                    ? "없음"
                    : `${selectedServiceIds.length}개 선택`
                }
              />
              {auction.purchaseMethod !== "현금" ? (
                <SummaryRow
                  label="월 납입료"
                  value={monthlyPayment ? `${formatWon(Number(monthlyPayment))}원` : "-"}
                />
              ) : null}
              {steps.includes("discount") ? (
                <SummaryRow
                  label="할인 금액"
                  value={discountAmount ? `${formatWon(Number(discountAmount))}원` : "-"}
                />
              ) : null}
              {steps.includes("capital") ? (
                <SummaryRow
                  label="캐피탈"
                  value={
                    capitalOptions.find((capital) => capital.id === capitalId)?.name ?? "-"
                  }
                />
              ) : null}
            </div>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

function stepLabel(step: BidWizardStep) {
  switch (step) {
    case "service":
      return "서비스";
    case "monthly":
      return "월 납입료";
    case "discount":
      return "할인 금액";
    case "capital":
      return "캐피탈";
  }
}

function stepDescription(step: BidWizardStep) {
  switch (step) {
    case "service":
      return "출고 서비스와 메모를 먼저 고릅니다.";
    case "monthly":
      return "월 납입료를 입력합니다.";
    case "discount":
      return "고객에게 제안할 할인 금액을 입력합니다.";
    case "capital":
      return "연결할 캐피탈사를 선택합니다.";
  }
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
