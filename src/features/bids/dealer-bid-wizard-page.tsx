"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { DealerAuctionDetail } from "@/entities/auction/schemas/dealer-auction-detail-schema";
import { dealerBidListQueryKey, dealerBidDetailQueryRoot } from "@/features/bids/lib/dealer-bid-query";
import { dealerBidWizardSubmitSchema } from "@/features/bids/schemas/dealer-bid-wizard-submit-schema";
import { useDealerAuctionDetailQuery } from "@/features/home/hooks/use-dealer-auction-detail-query";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import {
  listDealerBidCapitalOptions,
  listDealerBidServiceOptions,
  submitDealerBid,
} from "@/shared/api/dealer-marketplace";
import { appRoutes } from "@/shared/config/routes";

type DealerBidWizardPageProps = {
  auctionId: string;
};

type BidWizardStep = "service" | "monthly" | "discount" | "capital";

const purchaseMethodTone = {
  현금: "bg-emerald-50 text-emerald-700",
  할부: "bg-amber-50 text-amber-700",
  리스: "bg-slate-100 text-slate-600",
} as const;

function formatWon(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatAmountDisplay(rawValue: string) {
  const parsed = Number(rawValue || 0);
  if (!rawValue || Number.isNaN(parsed)) {
    return "0원";
  }

  return `${formatWon(parsed)}원`;
}

function formatAmountHint(rawValue: string) {
  const parsed = Number(rawValue || 0);
  if (!rawValue || Number.isNaN(parsed) || parsed === 0) {
    return "";
  }

  if (parsed >= 10000) {
    const man = Math.floor(parsed / 10000);
    const rest = parsed % 10000;
    return `${man}만${rest > 0 ? ` ${formatWon(rest)}` : ""}원`;
  }

  return `${formatWon(parsed)}원`;
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

function stepTitle(step: BidWizardStep) {
  switch (step) {
    case "service":
      return "출고 서비스를 선택해주세요";
    case "monthly":
      return "제안 월 납입료를 입력해주세요";
    case "discount":
      return "제안 할인금액을 입력해주세요";
    case "capital":
      return "캐피탈사를 선택해주세요";
  }
}

function stepSubtitle(step: BidWizardStep) {
  switch (step) {
    case "service":
      return "복수 선택 가능합니다";
    case "monthly":
      return "숫자 키패드로 제안 금액을 입력합니다";
    case "discount":
      return "고객에게 제안할 할인 금액을 입력합니다";
    case "capital":
      return "하나만 선택 가능합니다";
  }
}

function appendKeypadValue(currentValue: string, key: string) {
  if (key === "DEL") {
    return currentValue.slice(0, -1);
  }

  const nextValue = `${currentValue}${key}`;
  const normalized = nextValue.replace(/^0+(?=\d)/, "");
  return normalized.slice(0, 12);
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
  const [showMonthlyConfirm, setShowMonthlyConfirm] = useState(false);

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
      <div className="rounded-[28px] border border-line bg-white px-6 py-6">
        <div className="h-[320px] animate-pulse rounded-[24px] bg-slate-100" />
      </div>
    );
  }

  if (auctionDetailQuery.isError || !auctionDetailQuery.data) {
    return (
      <div className="rounded-[28px] border border-line bg-white px-6 py-6">
        <p className="text-sm text-rose-600">경매 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  const auction = auctionDetailQuery.data;
  const steps = buildBidWizardSteps(auction.purchaseMethod);
  const currentStep = steps[currentStepIndex];
  const isPriceStep = currentStep === "monthly" || currentStep === "discount";

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

  function submitCurrentBid() {
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

  function moveNextStep() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((value) => value + 1);
      return;
    }

    submitCurrentBid();
  }

  function handleProceed() {
    const validationError = validateCurrentStep();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);

    if (currentStep === "monthly") {
      setShowMonthlyConfirm(true);
      return;
    }

    moveNextStep();
  }

  function handleGoBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((value) => Math.max(value - 1, 0));
      setErrorMessage(null);
      return;
    }

    router.push(appRoutes.homeAuctionDetail(auction.id));
  }

  return (
    <section className="mx-auto max-w-[860px] space-y-5">
      <div className="rounded-[32px] border border-white/80 bg-white px-5 py-5 shadow-sm md:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            className="rounded-full border border-line px-3 py-2 text-sm font-medium text-slate-700"
            type="button"
            onClick={handleGoBack}
          >
            이전
          </button>
          <button
            className="rounded-full border border-line px-3 py-2 text-sm font-medium text-slate-700"
            type="button"
            onClick={() => router.push(appRoutes.homeAuctionDetail(auction.id))}
          >
            닫기
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          {steps.map((step, index) => (
            <div
              className={
                index <= currentStepIndex
                  ? "h-1 flex-1 rounded-full bg-slate-950"
                  : "h-1 flex-1 rounded-full bg-slate-200"
              }
              key={step}
            />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-slate-950">입찰하기</h1>
            <p className="mt-2 text-sm text-slate-600">
              {auction.brandName} {auction.modelName} {auction.trimName}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[auction.purchaseMethod]}`}
              >
                {auction.purchaseMethod}
              </span>
              <span className="text-slate-500">{formatWon(auction.askingPriceValue)}원</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {currentStepIndex + 1}/{steps.length}
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/80 bg-white px-5 py-6 shadow-sm md:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
          STEP {currentStepIndex + 1}/{steps.length}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">
          {stepTitle(currentStep)}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{stepSubtitle(currentStep)}</p>

        {currentStep === "service" ? (
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              {serviceOptions.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);

                return (
                  <button
                    className={
                      isSelected
                        ? "flex w-full items-center gap-3 rounded-2xl border-2 border-slate-950 bg-slate-50 px-4 py-4 text-left"
                        : "flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
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
                    <span
                      className={
                        isSelected
                          ? "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs text-white"
                          : "inline-flex h-5 w-5 shrink-0 rounded-full border border-slate-300"
                      }
                    >
                      {isSelected ? "✓" : null}
                    </span>
                    <span className="text-base font-medium text-slate-950">
                      {service.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">요청사항 (선택)</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none placeholder:text-slate-400"
                placeholder="추가 요청사항이 있다면 입력해주세요"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          </div>
        ) : null}

        {isPriceStep ? (
          <div className="mt-8">
            <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
              <p
                className={
                  errorMessage
                    ? "text-[40px] font-semibold tracking-[-0.03em] text-rose-600"
                    : "text-[40px] font-semibold tracking-[-0.03em] text-slate-950"
                }
              >
                {formatAmountDisplay(
                  currentStep === "monthly" ? monthlyPayment : discountAmount,
                )}
              </p>
              {errorMessage ? (
                <p className="mt-3 text-sm font-medium text-rose-600">{errorMessage}</p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  {formatAmountHint(
                    currentStep === "monthly" ? monthlyPayment : discountAmount,
                  ) || "숫자 키패드로 금액을 입력하세요"}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 pt-2">
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                ["00", "0", "DEL"],
              ].map((row, rowIndex) => (
                <div className="grid grid-cols-3" key={`keypad-row-${rowIndex}`}>
                  {row.map((key) => (
                    <button
                      className="h-16 border-b border-slate-200 text-2xl font-semibold text-slate-950 last:text-lg"
                      key={key}
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);

                        if (currentStep === "monthly") {
                          setMonthlyPayment((current) => appendKeypadValue(current, key));
                          return;
                        }

                        setDiscountAmount((current) => appendKeypadValue(current, key));
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-5">
              <button
                className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
                disabled={submitMutation.isPending}
                type="button"
                onClick={handleProceed}
              >
                다음
              </button>
            </div>
          </div>
        ) : null}

        {currentStep === "capital" ? (
          <div className="mt-6 space-y-2">
            {capitalOptions.map((capital) => {
              const isSelected = capitalId === capital.id;

              return (
                <button
                  className={
                    isSelected
                      ? "flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-slate-950 bg-slate-50 px-4 py-4 text-left"
                      : "flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
                  }
                  key={capital.id}
                  type="button"
                  onClick={() => {
                    setCapitalId(capital.id);
                    setErrorMessage(null);
                  }}
                >
                  <span className="text-base font-medium text-slate-950">
                    {capital.name}
                  </span>
                  <span className="text-lg text-slate-500">{isSelected ? "◉" : "○"}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {!isPriceStep && errorMessage ? (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {!isPriceStep ? (
        <div className="sticky bottom-4 z-10 rounded-[24px] border border-white/80 bg-white/95 p-4 shadow-lg backdrop-blur">
          <button
            className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
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
      ) : null}

      {showMonthlyConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-950">월 납입료 확인</h3>
            <p className="mt-3 text-sm text-slate-600">
              제안 월 납입료는{" "}
              <strong className="text-slate-950">
                {formatAmountDisplay(monthlyPayment)}
              </strong>
              입니다.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                className="flex-1 rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
                type="button"
                onClick={() => setShowMonthlyConfirm(false)}
              >
                다시 입력
              </button>
              <button
                className="flex-1 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white"
                type="button"
                onClick={() => {
                  setShowMonthlyConfirm(false);
                  moveNextStep();
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
