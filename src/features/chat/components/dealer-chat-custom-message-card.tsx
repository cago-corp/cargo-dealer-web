import Link from "next/link";
import type { DealerChatMessage, DealerChatRoom } from "@/entities/chat/schemas/dealer-chat-schema";

type DealerChatCustomMessageCardProps = {
  message: DealerChatMessage;
  room: Pick<DealerChatRoom, "dealId" | "id" | "vehicleLabel">;
  contractHref: string;
  detailHref: string;
};

const DEAL_STAGE_STEPPER = ["견적비교", "계약", "배정", "입금", "출고"] as const;

export function DealerChatCustomMessageCard({
  message,
  room,
  contractHref,
  detailHref,
}: DealerChatCustomMessageCardProps) {
  const customType = message.customPayload?.type ?? "";

  if (customType === "STATUS_CHANGE") {
    return (
      <StatusChangeCard
        description={message.customPayload?.description ?? "거래 단계가 변경되었습니다."}
        detailHref={detailHref}
        stageLabel={message.customPayload?.title ?? message.body}
      />
    );
  }

  if (customType === "ESTIMATE") {
    return (
      <EstimateCard
        contractHref={contractHref}
        fallbackVehicleLabel={room.vehicleLabel}
        payload={message.customPayload?.data ?? null}
      />
    );
  }

  if (customType === "IDENTITY_VERIFIED") {
    return <IdentityVerifiedCard detailHref={detailHref} />;
  }

  return (
    <article className="w-full max-w-[320px] rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-violet-700">
        안내
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950">
        {message.customPayload?.title ?? message.body}
      </p>
      {message.customPayload?.description ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {message.customPayload.description}
        </p>
      ) : null}
    </article>
  );
}

function StatusChangeCard({
  stageLabel,
  description,
  detailHref,
}: {
  stageLabel: string;
  description: string;
  detailHref: string;
}) {
  const currentStageIndex = getDealStageIndex(stageLabel);

  return (
    <article className="w-full max-w-[360px] rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <p className="text-lg font-semibold text-slate-950">{stageLabel}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 flex items-start">
        {DEAL_STAGE_STEPPER.map((stage, index) => {
          const isCurrent = index === currentStageIndex;
          const isPassed = index <= currentStageIndex;
          const isFirst = index === 0;
          const isLast = index === DEAL_STAGE_STEPPER.length - 1;

          return (
            <div className="min-w-0 flex-1" key={stage}>
              <div className="flex min-w-0 flex-col items-center">
                <div className="relative flex h-5 w-full items-center justify-center">
                  <div
                    className={
                      isFirst
                        ? "absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                        : isLast
                          ? "absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                          : "absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200"
                    }
                  />
                  {isFirst ? null : (
                    <div
                      className={
                        isPassed
                          ? "absolute left-0 right-1/2 top-1/2 h-px -translate-y-1/2 bg-violet-600"
                          : "hidden"
                      }
                    />
                  )}
                  {isLast ? null : (
                    <div
                      className={
                        index < currentStageIndex
                          ? "absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 bg-violet-600"
                          : "hidden"
                      }
                    />
                  )}
                  <div
                    className={
                      isCurrent
                        ? "relative z-10 h-3 w-3 rounded-full border-2 border-violet-600 bg-white"
                        : isPassed
                          ? "relative z-10 h-2.5 w-2.5 rounded-full bg-violet-600"
                          : "relative z-10 h-2.5 w-2.5 rounded-full bg-slate-200"
                    }
                  />
                </div>
                <p
                  className={
                    isCurrent
                      ? "mt-2 text-center text-[11px] font-semibold text-violet-700"
                      : isPassed
                        ? "mt-2 text-center text-[11px] font-semibold text-violet-600"
                        : "mt-2 text-center text-[11px] font-medium text-slate-400"
                  }
                >
                  {stage}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(90,42,235,0.18)]"
        href={detailHref}
      >
        거래 상세 보기
      </Link>
    </article>
  );
}

function EstimateCard({
  payload,
  fallbackVehicleLabel,
  contractHref,
}: {
  payload: Record<string, unknown> | null;
  fallbackVehicleLabel: string;
  contractHref: string;
}) {
  const estimateData = normalizeEstimatePayload(payload);
  const currentPrice = estimateData.isCash ? estimateData.finalPrice : estimateData.monthlyPayment;
  const expectedPrice = estimateData.isCash
    ? estimateData.expectedPrice
    : estimateData.expectedMonthlyPayment;
  const diff = currentPrice !== null && expectedPrice !== null ? expectedPrice - currentPrice : null;

  return (
    <article className="w-full max-w-[320px] rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-violet-700">
            최종 견적서
          </p>
          <p className="mt-2 truncate text-lg font-semibold text-slate-950">
            {estimateData.vehicleLabel || fallbackVehicleLabel}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
          {estimateData.purchaseMethod}
        </span>
      </div>

      {estimateData.options.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {estimateData.options.map((option) => (
            <span
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600"
              key={option}
            >
              {option}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
        {estimateData.purchaseMethod === "현금" ? (
          <EstimateRow label="지역" value={estimateData.region ?? "-"} />
        ) : (
          <>
            <EstimateRow
              label="계약 기간"
              value={estimateData.contractMonths ? `${estimateData.contractMonths}개월` : "-"}
            />
            <EstimateRow label="초기 납부" value={estimateData.initialPaymentLabel} />
            {estimateData.annualMileage ? (
              <EstimateRow
                label="연간 주행거리"
                value={`${new Intl.NumberFormat("ko-KR").format(estimateData.annualMileage)}km`}
              />
            ) : null}
            {estimateData.customerType ? (
              <EstimateRow label="고객 구분" value={estimateData.customerType} />
            ) : null}
            <EstimateRow label="지역" value={estimateData.region ?? "-"} />
          </>
        )}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-600">
          {estimateData.isCash ? "최종 결제 금액" : "당월 부과액"}
        </p>
        <p className="mt-2 text-right text-2xl font-semibold tracking-[-0.02em] text-slate-950">
          {currentPrice === null
            ? "-"
            : estimateData.isCash
              ? `${new Intl.NumberFormat("ko-KR").format(currentPrice)}원`
              : `월 ${new Intl.NumberFormat("ko-KR").format(currentPrice)}원`}
        </p>
        {diff !== null && diff !== 0 ? (
          <p className="mt-2 text-right text-xs font-medium text-slate-500">
            예상견적 대비{" "}
            <span className="text-violet-700">
              {new Intl.NumberFormat("ko-KR").format(Math.abs(diff))}원
            </span>{" "}
            {diff > 0 ? "감소" : "증가"}
          </p>
        ) : null}
      </div>

      <Link
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(90,42,235,0.18)]"
        href={contractHref}
      >
        최종 계약 열기
      </Link>
    </article>
  );
}

function IdentityVerifiedCard({ detailHref }: { detailHref: string }) {
  return (
    <article className="w-full max-w-[320px] rounded-[24px] border border-slate-200 bg-white px-5 py-5 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          ✓
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-950">인증 완료</p>
          <p className="text-sm text-slate-500">고객 본인 인증이 완료되었습니다.</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        계약 진행 전 필요한 본인 인증 절차가 끝났습니다. 다음 단계 상태와 세부 정보를 확인해 주세요.
      </p>
      <Link
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-slate-700"
        href={detailHref}
      >
        거래 상세 보기
      </Link>
    </article>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function normalizeEstimatePayload(payload: Record<string, unknown> | null) {
  const root = asRecord(payload);
  const final = asRecord(root?.final);
  const expected = asRecord(root?.expected);
  const vehicle = asRecord(root?.vehicle);
  const options = Array.isArray(root?.options)
    ? root.options.flatMap((option) => (typeof option === "string" ? [option] : []))
    : [];
  const purchaseMethod =
    getString(final?.purchase_method) ??
    getString(final?.final_purchase_method) ??
    getString(root?.purchase_method) ??
    "현금";
  const vehicleLabel =
    [
      getString(vehicle?.model_name),
      getString(vehicle?.grade_name),
    ]
      .filter(Boolean)
      .join(" ") || null;

  const finalPrice =
    getNumber(final?.price) ??
    getNumber(final?.final_vehicle_price) ??
    getNumber(root?.final_vehicle_price);
  const expectedPrice = getNumber(expected?.price) ?? getNumber(expected?.expected_price);
  const monthlyPayment =
    getNumber(final?.monthly_payment) ??
    getNumber(final?.final_monthly_payment) ??
    getNumber(root?.final_monthly_payment);
  const expectedMonthlyPayment =
    getNumber(expected?.monthly_payment) ?? getNumber(expected?.expected_monthly_payment);
  const contractMonths =
    getNumber(final?.period) ??
    getNumber(final?.final_contract_months) ??
    getNumber(root?.final_contract_months);
  const annualMileage =
    getNumber(final?.annual_mileage) ??
    getNumber(final?.final_annual_mileage) ??
    getNumber(root?.final_annual_mileage);
  const customerType =
    getString(final?.customer_type) ??
    getString(final?.final_customer_type) ??
    getString(root?.final_customer_type);
  const region =
    getString(final?.user_region) ??
    getString(final?.final_user_region) ??
    getString(root?.final_user_region);
  const advancePercent =
    getNumber(final?.advance_percent) ?? getNumber(root?.final_advance_down_payment_percent);
  const advanceAmount =
    getNumber(final?.advance_payment) ?? getNumber(root?.final_advance_down_payment_amount);
  const depositPercent =
    getNumber(final?.deposit_percent) ?? getNumber(root?.final_deposit_down_payment_percent);
  const depositAmount =
    getNumber(final?.deposit) ?? getNumber(root?.final_deposit_down_payment_amount);

  return {
    vehicleLabel,
    purchaseMethod,
    options,
    isCash: purchaseMethod === "현금",
    finalPrice,
    expectedPrice,
    monthlyPayment,
    expectedMonthlyPayment,
    contractMonths,
    annualMileage,
    customerType,
    region,
    initialPaymentLabel: formatInitialPaymentLabel({
      advanceAmount,
      advancePercent,
      depositAmount,
      depositPercent,
    }),
  };
}

function formatInitialPaymentLabel(input: {
  advancePercent: number | null;
  advanceAmount: number | null;
  depositPercent: number | null;
  depositAmount: number | null;
}) {
  if (input.advancePercent || input.advanceAmount) {
    return buildPercentAmountLabel("선납금", input.advancePercent, input.advanceAmount);
  }

  if (input.depositPercent || input.depositAmount) {
    return buildPercentAmountLabel("보증금", input.depositPercent, input.depositAmount);
  }

  return "-";
}

function buildPercentAmountLabel(
  prefix: string,
  percent: number | null,
  amount: number | null,
) {
  const amountLabel =
    amount === null ? null : `${new Intl.NumberFormat("ko-KR").format(amount)}원`;

  if (percent !== null && amountLabel) {
    return `${prefix} ${percent}% / ${amountLabel}`;
  }

  if (percent !== null) {
    return `${prefix} ${percent}%`;
  }

  if (amountLabel) {
    return `${prefix} ${amountLabel}`;
  }

  return "-";
}

function getDealStageIndex(stageLabel: string) {
  const normalized = stageLabel.replaceAll(/\s+/g, "");

  if (normalized.includes("견적")) {
    return 0;
  }

  if (normalized.includes("계약") || normalized.includes("서류확인")) {
    return 1;
  }

  if (normalized.includes("배정")) {
    return 2;
  }

  if (normalized.includes("입금") || normalized.includes("결제")) {
    return 3;
  }

  if (normalized.includes("출고")) {
    return 4;
  }

  return 1;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value);
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}
