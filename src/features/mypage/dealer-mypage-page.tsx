import { DealerProfileSummary } from "@/features/mypage/components/dealer-profile-summary";

export function DealerMypagePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          My Page
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">딜러 계정 / 설정</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          마이페이지는 승인 상태, 프로필, 운영 설정을 분리해 넣을 수 있도록 entity
          경계부터 최소 형태로 잡아뒀습니다.
        </p>
      </header>
      <DealerProfileSummary />
    </section>
  );
}
