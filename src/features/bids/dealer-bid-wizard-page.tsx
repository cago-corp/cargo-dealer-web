"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { dealerBidSuccessSchema } from "@/entities/bid/schemas/dealer-bid-schema";
import {
  dealerBidListQueryKey,
  dealerBidDetailQueryRoot,
  getDealerBidSuccessQueryKey,
} from "@/features/bids/lib/dealer-bid-query";
import {
  fetchDealerBidOptionsFromApi,
  submitDealerBidFromApi,
} from "@/features/bids/lib/dealer-bid-api";
import { dealerBidWizardSubmitSchema } from "@/features/bids/schemas/dealer-bid-wizard-submit-schema";
import { useDealerAuctionDetailQuery } from "@/features/home/hooks/use-dealer-auction-detail-query";
import { dealerAuctionWorkspaceQueryRoot } from "@/features/home/lib/dealer-auction-workspace-query";
import { appRoutes } from "@/shared/config/routes";

type DealerBidWizardPageProps = {
  auctionId: string;
};

const purchaseMethodTone = {
  현금: "bg-emerald-50 text-emerald-700",
  할부: "bg-amber-50 text-amber-700",
  리스: "bg-slate-100 text-slate-600",
} as const;

function formatWon(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatAmountInput(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

function parseNumberInput(value: string) {
  const numeric = value.replaceAll(",", "").replaceAll(/[^\d]/g, "");
  return numeric.slice(0, 12);
}

function formatKoreanAmountSummary(value: string) {
  if (!value) {
    return "";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "";
  }

  const units = [
    { unit: "억", value: 100000000 },
    { unit: "만", value: 10000 },
  ];
  let remainder = amount;
  const parts: string[] = [];

  for (const currentUnit of units) {
    const currentValue = Math.floor(remainder / currentUnit.value);

    if (currentValue > 0) {
      parts.push(`${currentValue}${currentUnit.unit}`);
      remainder %= currentUnit.value;
    }
  }

  if (remainder > 0 || parts.length === 0) {
    parts.push(`${remainder}`);
  }

  return `${parts.join("")}원`;
}

export function DealerBidWizardPage({ auctionId }: DealerBidWizardPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const auctionDetailQuery = useDealerAuctionDetailQuery(auctionId);
  const bidOptionsQuery = useQuery({
    queryKey: ["dealer-bid-options"],
    queryFn: fetchDealerBidOptionsFromApi,
  });

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [capitalId, setCapitalId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitMutation = useMutation({
    mutationFn: submitDealerBidFromApi,
    onSuccess: ({ submissionId }) => {
      if (!auctionDetailQuery.data || !bidOptionsQuery.data) {
        router.push(appRoutes.bidSuccess(submissionId));
        return;
      }

      const auction = auctionDetailQuery.data;
      const { serviceOptions, capitalOptions } = bidOptionsQuery.data;
      const selectedServices = serviceOptions.filter((option) =>
        selectedServiceIds.includes(option.id),
      );
      const selectedCapital =
        capitalOptions.find((option) => option.id === capitalId) ?? null;

      queryClient.setQueryData(
        getDealerBidSuccessQueryKey(submissionId),
        dealerBidSuccessSchema.parse({
          auction,
          submission: {
            id: submissionId,
            auctionId: auction.id,
            purchaseMethod: auction.purchaseMethod,
            monthlyPaymentValue:
              auction.purchaseMethod === "현금" ? null : Number(monthlyPayment || 0),
            discountAmountValue: Number(discountAmount || 0),
            capitalId: selectedCapital?.id ?? null,
            capitalName: selectedCapital?.name ?? null,
            note,
            currentRank: null,
            services: selectedServices,
            state: "bidding",
            submittedAt: new Date().toISOString(),
          },
        }),
      );
      queryClient.invalidateQueries({ queryKey: dealerAuctionWorkspaceQueryRoot });
      queryClient.invalidateQueries({ queryKey: dealerBidListQueryKey });
      queryClient.invalidateQueries({ queryKey: dealerBidDetailQueryRoot });
      router.push(appRoutes.bidSuccess(submissionId));
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "입찰 제출에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    },
  });

  if (auctionDetailQuery.isLoading || bidOptionsQuery.isLoading) {
    return (
      <div className="rounded-[28px] border border-line bg-white px-6 py-6">
        <div className="h-[420px] animate-pulse rounded-[24px] bg-slate-100" />
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

  if (bidOptionsQuery.isError || !bidOptionsQuery.data) {
    return (
      <div className="rounded-[28px] border border-line bg-white px-6 py-6">
        <p className="text-sm text-rose-600">입찰 옵션을 불러오지 못했습니다.</p>
      </div>
    );
  }

  const auction = auctionDetailQuery.data;
  const { serviceOptions, capitalOptions } = bidOptionsQuery.data;
  const showMonthlyField = auction.purchaseMethod !== "현금";
  const showCapitalField = auction.purchaseMethod === "리스";

  function handleSubmit() {
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

    if (showMonthlyField) {
      const monthlyPaymentValue = Number(monthlyPayment);

      if (!monthlyPayment || Number.isNaN(monthlyPaymentValue) || monthlyPaymentValue < 100000) {
        setErrorMessage("월 납입료는 최소 10만원 이상이어야 합니다.");
        return;
      }
    }

    const discountAmountValue = Number(discountAmount);
    if (!discountAmount || Number.isNaN(discountAmountValue) || discountAmountValue <= 0) {
      setErrorMessage("할인 금액을 입력해주세요.");
      return;
    }

    if (showCapitalField && !capitalId) {
      setErrorMessage("캐피탈사를 선택해주세요.");
      return;
    }

    setErrorMessage(null);

    submitMutation.mutate({
      auctionId: auction.id,
      purchaseMethod: auction.purchaseMethod,
      vehiclePrice: auction.askingPriceValue,
      ...parsed.data,
    });
  }

  return (
    <section className="mx-auto max-w-[1200px] space-y-6">
      <div className="rounded-[32px] border border-white/80 bg-white px-5 py-5 shadow-sm md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${purchaseMethodTone[auction.purchaseMethod]}`}
              >
                {auction.purchaseMethod}
              </span>
              <span className="text-sm text-slate-500">차량가 {auction.askingPriceLabel}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950 md:text-3xl">
              입찰 입력
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {auction.brandName} {auction.modelName} {auction.trimName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-line px-3 py-2 text-sm font-medium text-slate-700"
              type="button"
              onClick={() => router.push(appRoutes.homeAuctionDetail(auction.id))}
            >
              상세로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.68fr)]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/80 bg-white px-5 py-6 shadow-sm md:px-6">
            <h2 className="text-lg font-semibold text-slate-950">입찰 조건 입력</h2>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700">출고 서비스</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {serviceOptions.map((service) => {
                  const isSelected = selectedServiceIds.includes(service.id);

                  return (
                    <button
                      className={
                        isSelected
                          ? "flex items-start gap-3 rounded-2xl border-2 border-slate-950 bg-slate-50 px-4 py-4 text-left"
                          : "flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
                      }
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
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
                            ? "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs text-white"
                            : "mt-0.5 inline-flex h-5 w-5 shrink-0 rounded-full border border-slate-300"
                        }
                      >
                        {isSelected ? "✓" : null}
                      </span>
                      <span>
                        <span className="block text-base font-medium text-slate-950">
                          {service.name}
                        </span>
                        {service.description ? (
                          <span className="mt-1 block text-sm text-slate-500">
                            {service.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-8 block space-y-2">
              <span className="text-sm font-medium text-slate-700">요청사항</span>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none placeholder:text-slate-400"
                maxLength={200}
                placeholder="추가 요청사항이 있다면 입력해주세요"
                value={note}
                onChange={(event) => {
                  setErrorMessage(null);
                  setNote(event.target.value);
                }}
              />
            </label>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {showMonthlyField ? (
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">월 납입료</span>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <input
                      className="w-full bg-transparent text-2xl font-semibold text-slate-950 outline-none placeholder:text-slate-300"
                      inputMode="numeric"
                      placeholder="월 납입료 입력"
                      value={formatAmountInput(monthlyPayment)}
                      onChange={(event) => {
                        setErrorMessage(null);
                        setMonthlyPayment(parseNumberInput(event.target.value));
                      }}
                    />
                    {monthlyPayment ? (
                      <>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatKoreanAmountSummary(monthlyPayment)}
                        </p>
                      </>
                    ) : null}
                  </div>
                </label>
              ) : null}

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">할인 금액</span>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <input
                    className="w-full bg-transparent text-2xl font-semibold text-slate-950 outline-none placeholder:text-slate-300"
                    inputMode="numeric"
                    placeholder="할인 금액 입력"
                    value={formatAmountInput(discountAmount)}
                    onChange={(event) => {
                      setErrorMessage(null);
                      setDiscountAmount(parseNumberInput(event.target.value));
                    }}
                  />
                  {discountAmount ? (
                    <>
                      <p className="mt-2 text-xs text-slate-400">
                        {formatKoreanAmountSummary(discountAmount)}
                      </p>
                    </>
                  ) : null}
                </div>
              </label>
            </div>

            {showCapitalField ? (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-slate-700">캐피탈사 선택</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {capitalOptions.map((capital) => {
                    const isSelected = capitalId === capital.id;

                    return (
                      <button
                        className={
                          isSelected
                            ? "flex items-center justify-between rounded-2xl border-2 border-slate-950 bg-slate-50 px-4 py-4 text-left"
                            : "flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left"
                        }
                        key={capital.id}
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setCapitalId(capital.id);
                        }}
                      >
                        <span className="text-base font-medium text-slate-950">{capital.name}</span>
                        <span className="text-lg text-slate-500">{isSelected ? "◉" : "○"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] border border-white/80 bg-white px-5 py-6 shadow-sm md:px-6">
            <h2 className="text-lg font-semibold text-slate-950">입찰 요약</h2>

            <div className="mt-5 space-y-4">
              <SummaryRow label="차량가" value={auction.askingPriceLabel} />
              {showMonthlyField ? (
                <SummaryRow
                  label="월 납입료"
                  value={monthlyPayment ? formatWon(Number(monthlyPayment)) : "미입력"}
                />
              ) : null}
              <SummaryRow
                label="할인 금액"
                value={discountAmount ? formatWon(Number(discountAmount)) : "미입력"}
              />
              {showCapitalField ? (
                <SummaryRow
                  label="캐피탈"
                  value={
                    capitalOptions.find((option) => option.id === capitalId)?.name ?? "미선택"
                  }
                />
              ) : null}
              <SummaryRow
                label="출고 서비스"
                value={
                  selectedServiceIds.length > 0
                    ? `${selectedServiceIds.length}개 선택`
                    : "없음"
                }
              />
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="sticky bottom-4 rounded-[28px] border border-violet-200 bg-white/95 p-4 shadow-[0_18px_50px_rgba(76,29,149,0.12)] backdrop-blur">
            <button
              className="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-semibold text-white disabled:opacity-50"
              disabled={submitMutation.isPending}
              type="button"
              onClick={handleSubmit}
            >
              {submitMutation.isPending ? "입찰 제출 중..." : "입찰 제출"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}
