import { DealerQuoteList } from "@/features/quotes/components/dealer-quote-list";

export function DealerQuotesPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Quotes
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">견적 / 입찰 작업대</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          이 화면은 서버 상태 예시로 TanStack Query를 연결해두었습니다. 실제 API가
          정리되면 `shared/api`와 schema 경계만 바꿔도 확장 가능합니다.
        </p>
      </header>
      <DealerQuoteList />
    </section>
  );
}
