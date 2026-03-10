import { SectionCard } from "@/shared/ui/section-card";

const bidItems = [
  {
    id: "bid-001",
    vehicle: "기아 카니발 하이리무진",
    state: "가격 조정 대기",
    detail: "내 입찰 2건 · 고객 응답 대기",
  },
  {
    id: "bid-002",
    vehicle: "볼보 XC60",
    state: "계약 입력 대기",
    detail: "채팅 후속 액션 필요",
  },
] as const;

export function DealerBidsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Bids
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 입찰</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Flutter quote_dealer의 입찰 탭은 다음 단계에서 상세하게 옮깁니다. 이번
          턴에서는 경로와 IA를 먼저 고정해 home에서 이어지는 동선을 자연스럽게
          만들었습니다.
        </p>
      </header>

      <SectionCard
        title="입찰 파이프라인"
        description="상세 viewmodel 이식 전까지 현재 작업 흐름을 확인할 최소 자리입니다."
      >
        <div className="space-y-3">
          {bidItems.map((item) => (
            <article
              className="rounded-3xl border border-line bg-white p-5"
              key={item.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{item.id}</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    {item.vehicle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                </div>
                <span className="rounded-full bg-accentSoft px-3 py-1 text-sm font-medium text-teal-800">
                  {item.state}
                </span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </section>
  );
}
