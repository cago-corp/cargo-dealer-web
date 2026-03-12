"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { DealerContractSubmitPayload } from "@/entities/deal/schemas/dealer-contract-schema";
import { useDealerDealDetailQuery } from "@/features/deals/hooks/use-dealer-deal-detail-query";
import { dealerChatRoomListQueryKey, getDealerChatRoomQueryKey } from "@/features/chat/lib/dealer-chat-query";
import {
  fetchDealerContractInitDataFromApi,
  submitDealerContractFromApi,
} from "@/features/deals/lib/dealer-contract-api";
import {
  dealerDealListQueryKey,
  getDealerDealDetailQueryKey,
} from "@/features/deals/lib/dealer-deal-query";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type DealerContractPageProps = {
  dealId: string;
};

type ContractFormState = {
  purchaseMethod: DealerContractSubmitPayload["purchaseMethod"];
  customerType: NonNullable<DealerContractSubmitPayload["customerType"]>;
  region: string;
  finalVehiclePrice: string;
  finalDiscountAmount: string;
  exteriorColorId: string;
  interiorColorId: string;
  serviceItemIds: string[];
  monthlyPayment: string;
  contractMonths: string;
  annualMileage: string;
  initialPaymentType: "downPayment" | "deposit";
  initialPaymentPercent: string;
};

type ValidationErrors = Partial<Record<keyof ContractFormState, string>>;

const purchaseMethodOptions: DealerContractSubmitPayload["purchaseMethod"][] = [
  "현금",
  "할부",
  "리스",
  "장기렌트",
];

const customerTypeOptions = ["개인", "개인사업자", "법인"] as const;
const percentOptions = ["0", "10", "20", "30", "40", "50"] as const;
const contractPeriodOptions = ["12", "24", "36", "48", "60"] as const;
const annualMileageOptions = ["10000", "20000", "30000", "40000"] as const;
const regionOptions = ["서울", "경기", "인천", "부산", "대구", "대전", "광주"] as const;

const emptyFormState: ContractFormState = {
  purchaseMethod: "현금",
  customerType: "개인",
  region: "",
  finalVehiclePrice: "",
  finalDiscountAmount: "0",
  exteriorColorId: "",
  interiorColorId: "",
  serviceItemIds: [],
  monthlyPayment: "",
  contractMonths: "",
  annualMileage: "",
  initialPaymentType: "downPayment",
  initialPaymentPercent: "",
};

export function DealerContractPage({ dealId }: DealerContractPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const source = searchParams.get("source");
  const queryClient = useQueryClient();
  const dealDetailQuery = useDealerDealDetailQuery(dealId);
  const contractInitQuery = useQuery({
    queryKey: ["dealer-deal-contract-init", dealId],
    queryFn: () => fetchDealerContractInitDataFromApi(dealId),
  });
  const [formState, setFormState] = useState<ContractFormState>(emptyFormState);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (
      isInitialized ||
      !dealDetailQuery.data ||
      !contractInitQuery.data
    ) {
      return;
    }

    const detail = dealDetailQuery.data;
    const initData = contractInitQuery.data;
    const initialVehiclePrice = parseNumberFromLabel(detail.askingPriceLabel);
    const initialRegion = normalizeRegion(detail.deliveryRegion);
    const matchedExterior = initData.exteriorColors.find(
      (item) => item.name === detail.vehicleExteriorColorName,
    );
    const matchedInterior = initData.interiorColors.find(
      (item) => item.name === detail.vehicleInteriorColorName,
    );
    const selectedServices = initData.serviceItems
      .filter((item) => detail.services.some((service) => service.name === item.name))
      .map((item) => item.id);
    const initialPayment =
      detail.depositDownPaymentAmount && detail.depositDownPaymentAmount > 0
        ? {
            initialPaymentType: "deposit" as const,
            initialPaymentPercent:
              initialVehiclePrice > 0
                ? String(Math.round((detail.depositDownPaymentAmount / initialVehiclePrice) * 100))
                : "",
          }
        : {
            initialPaymentType: "downPayment" as const,
            initialPaymentPercent:
              initialVehiclePrice > 0 && detail.advanceDownPaymentAmount
                ? String(Math.round((detail.advanceDownPaymentAmount / initialVehiclePrice) * 100))
                : "",
          };

    setFormState({
      purchaseMethod: detail.purchaseMethod,
      customerType: normalizeCustomerType(detail.customerType),
      region: initialRegion,
      finalVehiclePrice: initialVehiclePrice > 0 ? String(initialVehiclePrice) : "",
      finalDiscountAmount: "0",
      exteriorColorId: matchedExterior?.id ?? "",
      interiorColorId: matchedInterior?.id ?? "",
      serviceItemIds: selectedServices,
      monthlyPayment: "",
      contractMonths: detail.contractMonths ? String(detail.contractMonths) : "",
      annualMileage: detail.annualMileage ? String(detail.annualMileage) : "",
      initialPaymentType: initialPayment.initialPaymentType,
      initialPaymentPercent: initialPayment.initialPaymentPercent,
    });
    setIsInitialized(true);
  }, [contractInitQuery.data, dealDetailQuery.data, isInitialized]);

  const submitMutation = useMutation({
    mutationFn: async (payload: DealerContractSubmitPayload) =>
      submitDealerContractFromApi(dealId, payload),
    onSuccess: async () => {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: dealerDealListQueryKey }),
        queryClient.invalidateQueries({ queryKey: getDealerDealDetailQueryKey(dealId) }),
        queryClient.invalidateQueries({ queryKey: dealerChatRoomListQueryKey }),
        roomId
          ? queryClient.invalidateQueries({ queryKey: getDealerChatRoomQueryKey(roomId) })
          : Promise.resolve(),
      ]);
      router.replace(`${appRoutes.dealDetail(dealId)}?contractUpdated=1`, { scroll: false });
    },
  });

  const summary = useMemo(() => buildContractSummary(formState), [formState]);
  const missingItems = useMemo(() => getMissingItems(formState), [formState]);

  if (dealDetailQuery.isLoading || contractInitQuery.isLoading) {
    return <div className="h-[720px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (
    dealDetailQuery.isError ||
    contractInitQuery.isError ||
    !dealDetailQuery.data ||
    !contractInitQuery.data
  ) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">
          계약 입력 화면을 불러오지 못했습니다.
        </p>
        <p className="mt-2 text-sm text-rose-600">
          잠시 후 다시 시도해 주세요.
        </p>
      </section>
    );
  }

  const detail = dealDetailQuery.data;
  const initData = contractInitQuery.data;
  const hasSubmittedContract =
    detail.askingPriceLabel !== "-" && detail.askingPriceLabel.trim().length > 0;
  const isCash = formState.purchaseMethod === "현금";
  const isLeaseOrRent =
    formState.purchaseMethod === "리스" || formState.purchaseMethod === "장기렌트";
  const backHref =
    source === "chat-window" && roomId
      ? appRoutes.chatWindow(roomId)
      : appRoutes.dealDetail(dealId);
  const backLabel =
    source === "chat-window" && roomId
      ? "채팅 창으로 돌아가기"
      : "거래 상세로 돌아가기";

  async function handleSubmit() {
    const nextErrors = validateContractForm(formState);
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await submitMutation.mutateAsync(toSubmitPayload(formState));
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-950"
            href={backHref}
          >
            <span aria-hidden="true">‹</span>
            {backLabel}
          </Link>
          <h1 className="text-3xl font-semibold text-slate-950">
            {hasSubmittedContract ? "최종 계약 수정" : "최종 계약 입력"}
          </h1>
          <p className="text-sm text-slate-600">
            {hasSubmittedContract
              ? `${detail.customerName} 고객에게 전달된 최신 계약 조건을 다시 확인하고 수정합니다.`
              : `${detail.customerName} 고객에게 전달할 최종 계약 조건을 입력합니다.`}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-sm text-slate-500">{detail.customerName}</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{detail.vehicleLabel}</p>
        </div>
      </header>

      {hasSubmittedContract ? (
        <div className="rounded-[28px] border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-800">
          이미 고객에게 전달된 최종 계약입니다. 수정 후 다시 전송하면 최신 조건으로 바로 갱신됩니다.
        </div>
      ) : null}

      {submitMutation.error instanceof Error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {submitMutation.error.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <SectionCard
            title="기본 조건"
            description="구매 방식과 고객 조건을 먼저 정해 주세요."
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <LabelText label="구매 방식" />
                <div className="grid gap-2 sm:grid-cols-4">
                  {purchaseMethodOptions.map((option) => (
                    <button
                      className={
                        formState.purchaseMethod === option
                          ? "rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                          : "rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
                      }
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormState((current) => ({
                          ...current,
                          purchaseMethod: option,
                          initialPaymentType:
                            option === "할부" ? "downPayment" : current.initialPaymentType,
                        }));
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {isLeaseOrRent ? (
                  <SelectField
                    error={validationErrors.customerType}
                    label="고객 구분"
                    options={customerTypeOptions.map((value) => ({
                      value,
                      label: value,
                    }))}
                    value={formState.customerType}
                    onChange={(value) =>
                      setFormState((current) => ({
                        ...current,
                        customerType: value as ContractFormState["customerType"],
                      }))
                    }
                  />
                ) : null}
                <SelectField
                  error={validationErrors.region}
                  label="공채용 지역"
                  options={regionOptions.map((value) => ({
                    value,
                    label: value,
                  }))}
                  placeholder="지역 선택"
                  value={formState.region}
                  onChange={(value) =>
                    setFormState((current) => ({
                      ...current,
                      region: value,
                    }))
                  }
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="차량 / 가격"
            description="최종 차량가, 할인, 색상을 입력합니다."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField
                error={validationErrors.finalVehiclePrice}
                helperText={formatWonKoreanSummary(formState.finalVehiclePrice)}
                label="최종 차량가"
                value={formState.finalVehiclePrice}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, finalVehiclePrice: value }))
                }
              />
              <NumberField
                error={validationErrors.finalDiscountAmount}
                helperText={formatWonKoreanSummary(formState.finalDiscountAmount)}
                label="할인 금액"
                value={formState.finalDiscountAmount}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, finalDiscountAmount: value }))
                }
              />
              <SelectField
                error={validationErrors.exteriorColorId}
                label="외장 색상"
                options={initData.exteriorColors.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder="외장 선택"
                value={formState.exteriorColorId}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, exteriorColorId: value }))
                }
              />
              <SelectField
                error={validationErrors.interiorColorId}
                label="내장 색상"
                options={initData.interiorColors.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder="내장 선택"
                value={formState.interiorColorId}
                onChange={(value) =>
                  setFormState((current) => ({ ...current, interiorColorId: value }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="금융 조건"
            description="할부, 리스, 장기렌트일 때만 필요한 조건입니다."
          >
            {isCash ? (
              <div className="rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-5 text-sm text-slate-500">
                현금 거래는 월 납입료와 계약 기간 입력이 필요하지 않습니다.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <NumberField
                    error={validationErrors.monthlyPayment}
                    helperText={formatWonKoreanSummary(formState.monthlyPayment)}
                    label="월 납입료"
                    value={formState.monthlyPayment}
                    onChange={(value) =>
                      setFormState((current) => ({ ...current, monthlyPayment: value }))
                    }
                  />
                  <SelectField
                    error={validationErrors.contractMonths}
                    label="계약 기간"
                    options={contractPeriodOptions.map((value) => ({
                      value,
                      label: `${value}개월`,
                    }))}
                    placeholder="기간 선택"
                    value={formState.contractMonths}
                    onChange={(value) =>
                      setFormState((current) => ({ ...current, contractMonths: value }))
                    }
                  />
                </div>

                {isLeaseOrRent ? (
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <SelectField
                      error={validationErrors.annualMileage}
                      label="연간 주행거리"
                      options={annualMileageOptions.map((value) => ({
                        value,
                        label: `${new Intl.NumberFormat("ko-KR").format(Number(value))}km`,
                      }))}
                      placeholder="주행거리 선택"
                      value={formState.annualMileage}
                      onChange={(value) =>
                        setFormState((current) => ({ ...current, annualMileage: value }))
                      }
                    />
                    <div className="space-y-3">
                      <LabelText label={formState.purchaseMethod === "할부" ? "선납금" : "초기 납부 방식"} />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <button
                          className={
                            formState.initialPaymentType === "downPayment"
                              ? "rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                              : "rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
                          }
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              initialPaymentType: "downPayment",
                            }))
                          }
                        >
                          선납금
                        </button>
                        <button
                          className={
                            formState.initialPaymentType === "deposit"
                              ? "rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                              : "rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-slate-700"
                          }
                          type="button"
                          onClick={() =>
                            setFormState((current) => ({
                              ...current,
                              initialPaymentType: "deposit",
                            }))
                          }
                        >
                          보증금
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <LabelText label="선납금" />
                    <div className="rounded-2xl border border-line bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      할부는 선납금 방식만 사용할 수 있습니다.
                    </div>
                  </div>
                )}

                <SelectField
                  error={validationErrors.initialPaymentPercent}
                  helperText={
                    formState.initialPaymentPercent === ""
                      ? null
                      : `${formState.initialPaymentType === "deposit" ? "보증금" : "선납금"} ${formatWon(calculateInitialPaymentAmount(formState), { allowZero: true })}`
                  }
                  label={formState.initialPaymentType === "deposit" ? "보증금 비율" : "선납금 비율"}
                  options={percentOptions.map((value) => ({
                    value,
                    label: `${value}%`,
                  }))}
                  placeholder="비율 선택"
                  value={formState.initialPaymentPercent}
                  onChange={(value) =>
                    setFormState((current) => ({ ...current, initialPaymentPercent: value }))
                  }
                />
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="출고 서비스"
            description="고객에게 제안할 서비스와 공채용 지역을 선택합니다."
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <LabelText label="출고 서비스" />
                <div className="grid gap-2 md:grid-cols-2">
                  {initData.serviceItems.map((item) => {
                    const isSelected = formState.serviceItemIds.includes(item.id);

                    return (
                      <button
                        className={
                          isSelected
                            ? "rounded-2xl border border-slate-950 bg-slate-950/5 px-4 py-3 text-left text-sm font-medium text-slate-950"
                            : "rounded-2xl border border-line bg-white px-4 py-3 text-left text-sm text-slate-700"
                        }
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setFormState((current) => ({
                            ...current,
                            serviceItemIds: current.serviceItemIds.includes(item.id)
                              ? current.serviceItemIds.filter((serviceId) => serviceId !== item.id)
                              : [...current.serviceItemIds, item.id],
                          }))
                        }
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <SectionCard
            title="전송 요약"
            description="필수 조건이 모두 채워지면 바로 전송할 수 있습니다."
          >
            <div className="space-y-4">
              <SummaryRow label="구매 방식" value={summary.purchaseMethod} />
              <SummaryRow label="공채용 지역" value={summary.region} />
              <SummaryRow label="최종 차량가" value={summary.finalVehiclePrice} />
              <SummaryRow label="할인 금액" value={summary.finalDiscountAmount} />
              <SummaryRow label="월 납입료" value={summary.monthlyPayment} />
              <SummaryRow label="계약 기간" value={summary.contractMonths} />
              <SummaryRow label="초기 납부" value={summary.initialPayment} />
              <SummaryRow label="선택 서비스" value={summary.services} />
            </div>
          </SectionCard>

          <SectionCard title="입력 상태">
            {missingItems.length === 0 ? (
              <div className="rounded-3xl bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
                전송 준비가 완료되었습니다.
              </div>
            ) : (
              <div className="rounded-3xl bg-amber-50 px-5 py-4">
                <p className="text-sm font-semibold text-amber-800">
                  아직 {missingItems.length}개 항목이 필요합니다.
                </p>
                <ul className="mt-3 space-y-2 text-sm text-amber-700">
                  {missingItems.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="mt-4 w-full rounded-2xl bg-violet-700 px-5 py-3.5 text-base font-semibold text-white shadow-[0_12px_24px_rgba(90,42,235,0.2)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              disabled={submitMutation.isPending}
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
            >
              {submitMutation.isPending
                ? "전송 중..."
                : hasSubmittedContract
                  ? "최종 계약 다시 전송"
                  : "최종 계약 전송"}
            </button>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

function LabelText({ label }: { label: string }) {
  return <p className="text-sm font-semibold text-slate-900">{label}</p>;
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  error,
  helperText,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  error?: string;
  helperText?: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <LabelText label={label} />
      <select
        className={
          error
            ? "w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none"
            : "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-slate-950 outline-none"
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder ?? "선택"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

function NumberField({
  label,
  value,
  helperText,
  error,
  onChange,
}: {
  label: string;
  value: string;
  helperText?: string | null;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <LabelText label={label} />
      <div
        className={
          error
            ? "rounded-[24px] border border-rose-300 bg-white px-4 py-4"
            : "rounded-[24px] border border-line bg-white px-4 py-4"
        }
      >
        <input
          className="w-full bg-transparent text-2xl font-semibold text-slate-950 outline-none placeholder:text-slate-300"
          inputMode="numeric"
          placeholder={`${label} 입력`}
          value={formatNumericInput(value)}
          onChange={(event) => onChange(sanitizeDigits(event.target.value))}
        />
        {helperText ? <p className="mt-2 text-sm text-slate-400">{helperText}</p> : null}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-950">{value}</span>
    </div>
  );
}

function buildContractSummary(formState: ContractFormState) {
  return {
    purchaseMethod: formState.purchaseMethod,
    region: formState.region || "-",
    finalVehiclePrice: formatWon(safeNumber(formState.finalVehiclePrice), { allowZero: false }),
    finalDiscountAmount: formatWon(safeNumber(formState.finalDiscountAmount), { allowZero: true }),
    monthlyPayment: formState.monthlyPayment
      ? formatWon(safeNumber(formState.monthlyPayment), { allowZero: true })
      : "-",
    contractMonths: formState.contractMonths ? `${formState.contractMonths}개월` : "-",
    initialPayment:
      formState.purchaseMethod === "현금"
        ? "해당 없음"
        : `${formState.initialPaymentType === "deposit" ? "보증금" : "선납금"} ${formState.initialPaymentPercent === "" ? "-" : `${formState.initialPaymentPercent}% / ${formatWon(calculateInitialPaymentAmount(formState), { allowZero: true })}`}`,
    services:
      formState.serviceItemIds.length === 0
        ? "선택 없음"
        : `${formState.serviceItemIds.length}개 선택`,
  };
}

function getMissingItems(formState: ContractFormState) {
  const errors = validateContractForm(formState);

  return Object.values(errors);
}

function validateContractForm(formState: ContractFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  if (safeNumber(formState.finalVehiclePrice) <= 0) {
    errors.finalVehiclePrice = "최종 차량가를 입력해 주세요.";
  }

  if (formState.finalDiscountAmount === "") {
    errors.finalDiscountAmount = "할인 금액을 입력해 주세요.";
  }

  if (!formState.exteriorColorId) {
    errors.exteriorColorId = "외장 색상을 선택해 주세요.";
  }

  if (!formState.interiorColorId) {
    errors.interiorColorId = "내장 색상을 선택해 주세요.";
  }

  if (!formState.region) {
    errors.region = "공채용 지역을 선택해 주세요.";
  }

  if (formState.purchaseMethod !== "현금") {
    if (safeNumber(formState.monthlyPayment) <= 0) {
      errors.monthlyPayment = "월 납입료를 입력해 주세요.";
    }

    if (!formState.contractMonths) {
      errors.contractMonths = "계약 기간을 선택해 주세요.";
    }

    if (formState.initialPaymentPercent === "") {
      errors.initialPaymentPercent = "초기 납부 비율을 선택해 주세요.";
    }
  }

  if (formState.purchaseMethod === "리스" || formState.purchaseMethod === "장기렌트") {
    if (!formState.annualMileage) {
      errors.annualMileage = "연간 주행거리를 선택해 주세요.";
    }

    if (!formState.customerType) {
      errors.customerType = "고객 구분을 선택해 주세요.";
    }
  }

  return errors;
}

function toSubmitPayload(formState: ContractFormState): DealerContractSubmitPayload {
  const finalVehiclePrice = safeNumber(formState.finalVehiclePrice);
  const finalDiscountAmount = safeNumber(formState.finalDiscountAmount);
  const monthlyPayment = safeNumber(formState.monthlyPayment);
  const initialPaymentPercent =
    formState.initialPaymentPercent === "" ? null : safeNumber(formState.initialPaymentPercent);
  const initialPaymentAmount = initialPaymentPercent === null
    ? null
    : calculateInitialPaymentAmount(formState);

  return {
    finalVehiclePrice,
    finalDiscountAmount,
    purchaseMethod: formState.purchaseMethod,
    region: formState.region,
    exteriorColorId: formState.exteriorColorId,
    interiorColorId: formState.interiorColorId,
    optionTypeIds: formState.serviceItemIds,
    monthlyPayment: formState.purchaseMethod === "현금" ? null : monthlyPayment,
    contractMonths:
      formState.purchaseMethod === "현금" || formState.contractMonths === ""
        ? null
        : safeNumber(formState.contractMonths),
    annualMileage:
      formState.purchaseMethod === "리스" || formState.purchaseMethod === "장기렌트"
        ? safeNumber(formState.annualMileage)
        : null,
    customerType:
      formState.purchaseMethod === "리스" || formState.purchaseMethod === "장기렌트"
        ? formState.customerType
        : null,
    advancePercent:
      formState.purchaseMethod === "현금" ||
      formState.initialPaymentType === "deposit" ||
      initialPaymentPercent === null
        ? null
        : initialPaymentPercent,
    advanceAmount:
      formState.purchaseMethod === "현금" ||
      formState.initialPaymentType === "deposit"
        ? null
        : initialPaymentAmount,
    depositPercent:
      formState.purchaseMethod === "현금" ||
      formState.initialPaymentType === "downPayment" ||
      initialPaymentPercent === null
        ? null
        : initialPaymentPercent,
    depositAmount:
      formState.purchaseMethod === "현금" ||
      formState.initialPaymentType === "downPayment"
        ? null
        : initialPaymentAmount,
  };
}

function sanitizeDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function formatNumericInput(value: string) {
  if (!value) {
    return "";
  }

  return new Intl.NumberFormat("ko-KR").format(Number(value));
}

function safeNumber(value: string) {
  if (!value) {
    return 0;
  }

  return Number(value);
}

function parseNumberFromLabel(value: string) {
  return safeNumber(value.replace(/[^\d]/g, ""));
}

function calculateInitialPaymentAmount(formState: ContractFormState) {
  const finalVehiclePrice = safeNumber(formState.finalVehiclePrice);
  const initialPaymentPercent =
    formState.initialPaymentPercent === "" ? null : safeNumber(formState.initialPaymentPercent);

  if (!finalVehiclePrice || initialPaymentPercent === null) {
    return 0;
  }

  return Math.round(finalVehiclePrice * (initialPaymentPercent / 100));
}

function formatWon(value: number, options?: { allowZero?: boolean }) {
  if (!options?.allowZero && !value) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function formatWonKoreanSummary(value: string) {
  const amount = safeNumber(value);

  if (!amount) {
    return null;
  }

  return `${toKoreanWon(amount)}원`;
}

function toKoreanWon(value: number) {
  const units = [
    { unit: "억", value: 100000000 },
    { unit: "만", value: 10000 },
  ];

  let remaining = value;
  let result = "";

  for (const current of units) {
    if (remaining >= current.value) {
      const amount = Math.floor(remaining / current.value);
      remaining %= current.value;
      result += `${amount}${current.unit}`;
    }
  }

  if (remaining > 0 || result === "") {
    result += `${remaining}`;
  }

  return result;
}

function normalizeRegion(value: string) {
  const firstToken = value.split(" ")[0] ?? "";
  return regionOptions.includes(firstToken as (typeof regionOptions)[number]) ? firstToken : "";
}

function normalizeCustomerType(value: string | null) {
  if (value === "개인" || value === "개인사업자" || value === "법인") {
    return value;
  }

  return "개인";
}
