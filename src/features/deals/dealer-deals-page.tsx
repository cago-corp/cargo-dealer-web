import { SectionCard } from "@/shared/ui/section-card";

const dealItems = [
  {
    id: "deal-001",
    vehicle: "기아 카니발 하이리무진",
    state: "서류 확인",
    detail: "고객 서류 업로드 대기",
  },
  {
    id: "deal-002",
    vehicle: "기아 EV9",
    state: "출고 준비",
    detail: "계약 이후 후속 진행 중",
  },
] as const;

export function DealerDealsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Deals
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">내 거래</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Flutter quote_dealer의 거래 탭을 웹 전용 목록으로 분리했습니다. 이후에는
          단계별 deal detail과 chat 진입을 여기서 이어받습니다.
        </p>
      </header>

      <SectionCard
        title="거래 후속 진행"
        description="계약 입력, 서류 확인, 출고 준비 같은 상태를 이 화면에서 관리하게 됩니다."
      >
        <div className="space-y-3">
          {dealItems.map((item) => (
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
                <span className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
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
