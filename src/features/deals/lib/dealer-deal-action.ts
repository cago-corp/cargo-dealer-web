import type { DealerDealDetail } from "@/entities/deal/schemas/dealer-deal-schema";

export const dealerDealStatusCodes = {
  contractRequest: "계약요청",
  depositWait: "계약금_입금대기",
  assignmentProgress: "배정진행",
  assignmentComplete: "배정완료",
  paymentWait: "결제대기",
  paymentComplete: "결제완료",
  deliveryProgress: "출고진행",
  deliveryDelay: "출고지연",
  deliveryComplete: "출고완료",
  canceled: "계약취소",
} as const;

export type DealerDealActionKind =
  | "waitingForCustomerContract"
  | "confirmDeposit"
  | "scheduleAssignment"
  | "assignmentCompleted"
  | "paymentPending"
  | "paymentCompleted"
  | "scheduleDelivery"
  | "deliveryScheduled"
  | "completed"
  | "canceled"
  | "unsupported";

export type DealerDealActionModel = {
  kind: DealerDealActionKind;
  stepIndex: number;
  statusCode: string;
  description?: string;
  primaryLabel?: string;
  dateLabel?: string;
  dateValue?: string | null;
  allowDateEdit?: boolean;
  showCancelAction?: boolean;
  cancelLabel?: string;
  terminalMessage?: string;
};

export function getDealerDealStepIndex(statusCode: string | null | undefined) {
  switch (statusCode) {
    case dealerDealStatusCodes.contractRequest:
    case dealerDealStatusCodes.depositWait:
      return 0;
    case dealerDealStatusCodes.assignmentProgress:
    case dealerDealStatusCodes.assignmentComplete:
      return 1;
    case dealerDealStatusCodes.paymentWait:
    case dealerDealStatusCodes.paymentComplete:
      return 2;
    case dealerDealStatusCodes.deliveryProgress:
    case dealerDealStatusCodes.deliveryDelay:
    case dealerDealStatusCodes.deliveryComplete:
    case dealerDealStatusCodes.canceled:
      return 3;
    default:
      return 0;
  }
}

export function getDealerDealActionModel(
  detail: Pick<
    DealerDealDetail,
    "statusCode" | "expectedAssignmentDate" | "expectedReleaseDate" | "askingPriceLabel"
  >,
): DealerDealActionModel {
  const statusCode = detail.statusCode ?? "";
  const stepIndex = getDealerDealStepIndex(statusCode);
  const hasSubmittedContract =
    detail.askingPriceLabel !== "-" && detail.askingPriceLabel.trim().length > 0;

  switch (statusCode) {
    case dealerDealStatusCodes.contractRequest:
      return {
        kind: "waitingForCustomerContract",
        stepIndex,
        statusCode,
        description: hasSubmittedContract
          ? "보낸 최종 계약 조건을 다시 열어 수정할 수 있습니다. 고객 계약 전까지는 여러 번 갱신해도 됩니다."
          : "최종 계약 조건을 입력하고 고객에게 전달해 주세요. 전송 후에는 고객 본인인증과 계약금 입금 단계로 이어집니다.",
        primaryLabel: hasSubmittedContract ? "최종 계약 수정" : "최종 계약 입력",
      };
    case dealerDealStatusCodes.depositWait:
      return {
        kind: "confirmDeposit",
        stepIndex,
        statusCode,
        description: "계약이 체결되었습니다.\n고객님의 입금을 기다리고 있습니다.",
        primaryLabel: "계약금 입금 확인",
      };
    case dealerDealStatusCodes.assignmentProgress:
      return {
        kind: "scheduleAssignment",
        stepIndex,
        statusCode,
        description: "배정이 확정되었다면 일자를 입력해주세요.",
        primaryLabel: "차량 배정 완료 (날짜 선택)",
        showCancelAction: true,
        cancelLabel: "거래 취소",
      };
    case dealerDealStatusCodes.assignmentComplete:
      return {
        kind: "assignmentCompleted",
        stepIndex,
        statusCode,
        dateLabel: "배정 확정일",
        dateValue: detail.expectedAssignmentDate,
        allowDateEdit: true,
        showCancelAction: true,
        cancelLabel: "거래 취소",
      };
    case dealerDealStatusCodes.paymentWait:
      return {
        kind: "paymentPending",
        stepIndex,
        statusCode,
        description: "고객의 결제/펀딩 처리를 대기 중입니다.",
        primaryLabel: "결제 확인 완료",
        showCancelAction: true,
        cancelLabel: "거래 취소",
      };
    case dealerDealStatusCodes.paymentComplete:
      return {
        kind: "paymentCompleted",
        stepIndex,
        statusCode,
        description: "결제가 완료되었습니다. 출고를 시작해주세요.",
        primaryLabel: "차량 출고 시작",
        showCancelAction: true,
        cancelLabel: "거래 취소",
      };
    case dealerDealStatusCodes.deliveryProgress:
    case dealerDealStatusCodes.deliveryDelay:
      if (!detail.expectedReleaseDate) {
        return {
          kind: "scheduleDelivery",
          stepIndex,
          statusCode,
          description: "출고 준비 완료 시 예정일을 입력해주세요.",
          primaryLabel: "출고 예정일 선택",
          showCancelAction: true,
          cancelLabel: "계약 취소",
        };
      }

      return {
        kind: "deliveryScheduled",
        stepIndex,
        statusCode,
        dateLabel: "출고 예정일",
        dateValue: detail.expectedReleaseDate,
        allowDateEdit: true,
        primaryLabel: "출고 완료 (종료)",
        showCancelAction: true,
        cancelLabel: "계약 취소",
      };
    case dealerDealStatusCodes.deliveryComplete:
      return {
        kind: "completed",
        stepIndex,
        statusCode,
        dateLabel: "실제 출고일",
        dateValue: detail.expectedReleaseDate,
        terminalMessage: "차량 출고가 완료되었습니다.",
      };
    case dealerDealStatusCodes.canceled:
      return {
        kind: "canceled",
        stepIndex,
        statusCode,
        terminalMessage: "거래가 취소되었습니다.",
      };
    default:
      return {
        kind: "unsupported",
        stepIndex,
        statusCode,
        terminalMessage: "지원하지 않는 거래 상태입니다.",
      };
  }
}
