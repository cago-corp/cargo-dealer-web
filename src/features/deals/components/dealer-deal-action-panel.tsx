"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import type { DealerDealDetail } from "@/entities/deal/schemas/dealer-deal-schema";
import { useDealerDealActions } from "@/features/deals/hooks/use-dealer-deal-actions";
import {
  dealerDealStatusCodes,
  getDealerDealActionModel,
} from "@/features/deals/lib/dealer-deal-action";
import { appRoutes } from "@/shared/config/routes";

type DealerDealActionPanelProps = {
  detail: DealerDealDetail;
};

type ConfirmActionState = {
  label: string;
  title: string;
  description?: string;
  targetStatusCode: string;
} | null;

type DateActionState = {
  kind: "assignment" | "release";
  label: string;
  title: string;
  value: string;
  targetStatusCode?: string;
} | null;

export function DealerDealActionPanel({ detail }: DealerDealActionPanelProps) {
  const actionModel = getDealerDealActionModel(detail);
  const actions = useDealerDealActions(detail);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);
  const [dateAction, setDateAction] = useState<DateActionState>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const cancelReasonId = useId();

  async function submitDateAction() {
    if (!dateAction?.value) {
      return;
    }

    if (dateAction.targetStatusCode) {
      await actions.updateDateAndStatus({
        kind: dateAction.kind,
        date: dateAction.value,
        targetStatusCode: dateAction.targetStatusCode,
      });
    } else {
      await actions.modifyDateOnly({
        kind: dateAction.kind,
        date: dateAction.value,
      });
    }

    setDateAction(null);
  }

  async function submitCancelAction() {
    const trimmedReason = cancelReason.trim();

    if (!trimmedReason) {
      return;
    }

    await actions.cancelDeal(trimmedReason);
    setCancelReason("");
    setIsCancelOpen(false);
  }

  return (
    <>
      <div className="space-y-4">
        {actions.errorMessage ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actions.errorMessage}
          </div>
        ) : null}

        {renderActionBody({
          actionModel,
          detail,
          disabled: actions.isPending,
          onOpenConfirmAction: setConfirmAction,
          onOpenDateAction: setDateAction,
          onOpenCancelAction() {
            setIsCancelOpen(true);
          },
        })}
      </div>

      {confirmAction ? (
        <ActionModal
          actionLabel={confirmAction.label}
          description={confirmAction.description}
          isBusy={actions.isPending}
          title={confirmAction.title}
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            await actions.updateStatus({
              targetStatusCode: confirmAction.targetStatusCode,
            });
            setConfirmAction(null);
          }}
        />
      ) : null}

      {dateAction ? (
        <ActionModal
          actionLabel={dateAction.label}
          isBusy={actions.isPending}
          title={dateAction.title}
          onClose={() => setDateAction(null)}
          onConfirm={submitDateAction}
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">날짜</span>
            <input
              className="w-full rounded-2xl border border-line px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-slate-950"
              type="date"
              value={dateAction.value}
              onChange={(event) =>
                setDateAction((current) =>
                  current
                    ? {
                        ...current,
                        value: event.target.value,
                      }
                    : current,
                )
              }
            />
          </label>
        </ActionModal>
      ) : null}

      {isCancelOpen ? (
        <ActionModal
          actionLabel="거래 취소"
          isBusy={actions.isPending}
          title="거래를 취소할까요?"
          onClose={() => {
            setIsCancelOpen(false);
            setCancelReason("");
          }}
          onConfirm={submitCancelAction}
        >
          <label className="space-y-2" htmlFor={cancelReasonId}>
            <span className="text-sm font-medium text-slate-700">취소 사유</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-line px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-slate-950"
              id={cancelReasonId}
              maxLength={200}
              placeholder="취소 사유를 입력해주세요."
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
            />
          </label>
        </ActionModal>
      ) : null}
    </>
  );
}

function renderActionBody({
  actionModel,
  detail,
  disabled,
  onOpenConfirmAction,
  onOpenDateAction,
  onOpenCancelAction,
}: {
  actionModel: ReturnType<typeof getDealerDealActionModel>;
  detail: DealerDealDetail;
  disabled: boolean;
  onOpenConfirmAction: (nextState: ConfirmActionState) => void;
  onOpenDateAction: (nextState: DateActionState) => void;
  onOpenCancelAction: () => void;
}) {
  switch (actionModel.kind) {
    case "waitingForCustomerContract":
      return (
        <WaitingPanel
          actionHref={appRoutes.dealContract(
            detail.id,
            detail.chatRoomId.startsWith("pending:") ? undefined : detail.chatRoomId,
          )}
          actionLabel="최종 계약 입력"
          description={
            actionModel.description ??
            "최종 계약 조건을 먼저 입력하고 고객에게 전달해 주세요. 전송 후에는 고객 본인인증과 계약금 입금 단계로 이어집니다."
          }
          title="최종 계약 입력이 먼저 필요합니다."
        />
      );
    case "confirmDeposit":
      return (
        <ActionPanelLayout>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {actionModel.description}
          </p>
          <PrimaryActionButton
            disabled={disabled}
            label={actionModel.primaryLabel ?? "계약금 입금 확인"}
            onClick={() =>
              onOpenConfirmAction({
                label: actionModel.primaryLabel ?? "계약금 입금 확인",
                title: "계약금 입금을 확인했어요?",
                description: "확인 후 다음 단계인 차량 배정으로 이동합니다.",
                targetStatusCode: dealerDealStatusCodes.assignmentProgress,
              })
            }
          />
        </ActionPanelLayout>
      );
    case "scheduleAssignment":
      return (
        <ActionPanelLayout>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {actionModel.description}
          </p>
          <PrimaryActionButton
            disabled={disabled}
            label={actionModel.primaryLabel ?? "차량 배정 완료 (날짜 선택)"}
            onClick={() =>
              onOpenDateAction({
                kind: "assignment",
                label: actionModel.primaryLabel ?? "차량 배정 완료 (날짜 선택)",
                title: "배정 확정일을 입력해 주세요.",
                value: todayDateInputValue(),
                targetStatusCode: dealerDealStatusCodes.assignmentComplete,
              })
            }
          />
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "거래 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "assignmentCompleted":
      return (
        <ActionPanelLayout>
          <DateDisplay
            label={actionModel.dateLabel ?? "배정 확정일"}
            value={actionModel.dateValue ?? detail.expectedAssignmentDate}
          />
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <SecondaryActionButton
              disabled={disabled}
              label="날짜 수정"
              onClick={() =>
                onOpenDateAction({
                  kind: "assignment",
                  label: "날짜 수정",
                  title: "배정 확정일을 수정할까요?",
                  value: toDateInputValue(actionModel.dateValue ?? detail.expectedAssignmentDate),
                })
              }
            />
            <PrimaryActionButton
              disabled={disabled}
              label="결제 요청 (다음)"
              onClick={() =>
                onOpenConfirmAction({
                  label: "결제 요청 (다음)",
                  title: "잔금 결제 단계로 이동할까요?",
                  targetStatusCode: dealerDealStatusCodes.paymentWait,
                })
              }
            />
          </div>
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "거래 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "paymentPending":
      return (
        <ActionPanelLayout>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {actionModel.description}
          </p>
          <PrimaryActionButton
            disabled={disabled}
            label={actionModel.primaryLabel ?? "결제 확인 완료"}
            onClick={() =>
              onOpenConfirmAction({
                label: actionModel.primaryLabel ?? "결제 확인 완료",
                title: "고객 결제가 완료되었나요?",
                targetStatusCode: dealerDealStatusCodes.paymentComplete,
              })
            }
          />
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "거래 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "paymentCompleted":
      return (
        <ActionPanelLayout>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {actionModel.description}
          </p>
          <PrimaryActionButton
            disabled={disabled}
            label={actionModel.primaryLabel ?? "차량 출고 시작"}
            onClick={() =>
              onOpenConfirmAction({
                label: actionModel.primaryLabel ?? "차량 출고 시작",
                title: "차량 출고를 시작할까요?",
                targetStatusCode: dealerDealStatusCodes.deliveryProgress,
              })
            }
          />
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "거래 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "scheduleDelivery":
      return (
        <ActionPanelLayout>
          <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
            {actionModel.description}
          </p>
          <PrimaryActionButton
            disabled={disabled}
            label={actionModel.primaryLabel ?? "출고 예정일 선택"}
            onClick={() =>
              onOpenDateAction({
                kind: "release",
                label: actionModel.primaryLabel ?? "출고 예정일 선택",
                title: "출고 예정일을 입력해 주세요.",
                value: todayDateInputValue(),
              })
            }
          />
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "계약 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "deliveryScheduled":
      return (
        <ActionPanelLayout>
          <DateDisplay
            label={actionModel.dateLabel ?? "출고 예정일"}
            value={actionModel.dateValue ?? detail.expectedReleaseDate}
          />
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <SecondaryActionButton
              disabled={disabled}
              label="일정 변경"
              onClick={() =>
                onOpenDateAction({
                  kind: "release",
                  label: "일정 변경",
                  title: "출고 예정일을 수정할까요?",
                  value: toDateInputValue(actionModel.dateValue ?? detail.expectedReleaseDate),
                })
              }
            />
            <PrimaryActionButton
              disabled={disabled}
              label={actionModel.primaryLabel ?? "출고 완료 (종료)"}
              onClick={() =>
                onOpenConfirmAction({
                  label: actionModel.primaryLabel ?? "출고 완료 (종료)",
                  title: "차량 출고를 완료할까요?",
                  targetStatusCode: dealerDealStatusCodes.deliveryComplete,
                })
              }
            />
          </div>
          <TextActionButton
            disabled={disabled}
            label={actionModel.cancelLabel ?? "계약 취소"}
            tone="danger"
            onClick={onOpenCancelAction}
          />
        </ActionPanelLayout>
      );
    case "completed":
    case "canceled":
    case "unsupported":
      return (
        <ActionPanelLayout>
          {actionModel.dateValue ? (
            <DateDisplay
              label={actionModel.dateLabel ?? "실제 출고일"}
              value={actionModel.dateValue}
            />
          ) : null}
          <div className="rounded-3xl bg-slate-100 px-5 py-4 text-center text-sm font-semibold text-slate-600">
            {actionModel.terminalMessage}
          </div>
        </ActionPanelLayout>
      );
    default:
      return null;
  }
}

function ActionPanelLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-4 rounded-3xl bg-slate-50 p-5">{children}</div>;
}

function WaitingPanel({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="space-y-4 rounded-3xl border border-dashed border-line bg-slate-50 px-5 py-5">
      <p className="text-base font-semibold text-slate-950">{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function DateDisplay({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white px-5 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">
        {value ? formatDateTimeLabel(value) : "-"}
      </p>
    </div>
  );
}

function PrimaryActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SecondaryActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full rounded-2xl border border-line px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function TextActionButton({
  label,
  disabled,
  tone,
  onClick,
}: {
  label: string;
  disabled: boolean;
  tone: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      className={
        tone === "danger"
          ? "text-sm font-medium text-rose-600 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-rose-200"
          : "text-sm font-medium text-slate-600 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-slate-300"
      }
      disabled={disabled}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function ActionModal({
  title,
  description,
  actionLabel,
  isBusy,
  children,
  onClose,
  onConfirm,
}: {
  title: string;
  description?: string;
  actionLabel: string;
  isBusy: boolean;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        {description ? (
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-5">{children}</div> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-slate-700"
            disabled={isBusy}
            type="button"
            onClick={onClose}
          >
            닫기
          </button>
          <button
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isBusy}
            type="button"
            onClick={() => {
              void onConfirm();
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) {
    return todayDateInputValue();
  }

  return new Date(value).toISOString().slice(0, 10);
}

function todayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}
