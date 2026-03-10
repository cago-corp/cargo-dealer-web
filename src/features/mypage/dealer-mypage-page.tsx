import { DealerProfileSummary } from "@/features/mypage/components/dealer-profile-summary";

export function DealerMypagePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          My Page
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">마이 페이지</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          계정 정보와 현재 운영 상태를 확인할 수 있습니다.
        </p>
      </header>
      <DealerProfileSummary />
    </section>
  );
}
