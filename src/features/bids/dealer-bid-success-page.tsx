"use client";

import Link from "next/link";
import { useDealerBidSuccessQuery } from "@/features/bids/hooks/use-dealer-bid-success-query";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type DealerBidSuccessPageProps = {
  submissionId: string;
};

function formatWon(value: number | null) {
  if (value === null) {
    return "-";
  }

  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function DealerBidSuccessPage({
  submissionId,
}: DealerBidSuccessPageProps) {
  const successQuery = useDealerBidSuccessQuery(submissionId);

  if (successQuery.isLoading) {
    return (
      <SectionCard title="입찰 완료" description="완료 정보를 불러오는 중입니다.">
        <div className="h-[320px] animate-pulse rounded-[28px] bg-slate-100" />
      </SectionCard>
    );
  }

  if (successQuery.isError || !successQuery.data) {
    return (
      <SectionCard title="입찰 완료" description="완료 정보를 불러오지 못했습니다.">
        <p className="text-sm text-rose-600">잠시 후 다시 시도해 주세요.</p>
      </SectionCard>
    );
  }

  const { auction, submission } = successQuery.data;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-[32px] border border-white/80 bg-white px-8 py-10 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-950 text-3xl text-white">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">
          입찰이 완료되었어요.
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          입찰 마감 시간:{" "}
          {new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(auction.deadlineAt))}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          진행 상황과 결과는 이제 `내 입찰`에서 확인할 수 있습니다.
        </p>
      </div>

      <SectionCard
        title="최종 입찰 요약"
        description="Flutter bid success의 요약 카드를 웹 요약판으로 옮겼습니다."
      >
        <div className="space-y-4">
          <SummaryRow
            label="차량명"
            value={`${auction.brandName} ${auction.modelName} ${auction.trimName}`}
          />
          <SummaryRow label="차량가" value={auction.askingPriceLabel} />
          <SummaryRow
            label="월 납입료"
            value={formatWon(submission.monthlyPaymentValue)}
          />
          <SummaryRow
            label="할인 금액"
            value={formatWon(submission.discountAmountValue)}
          />
          <SummaryRow label="캐피탈" value={submission.capitalName ?? "-"} />
          <SummaryRow
            label="출고 서비스"
            value={
              submission.services.length === 0
                ? "없음"
                : submission.services.map((service) => service.name).join(", ")
            }
          />
        </div>
      </SectionCard>

      <div className="flex flex-col gap-3">
        <Link
          className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white"
          href={appRoutes.bids()}
        >
          내 입찰 바로가기
        </Link>
        <Link
          className="rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
          href={appRoutes.home()}
        >
          홈으로 돌아가기
        </Link>
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
