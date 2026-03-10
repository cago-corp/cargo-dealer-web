import { SectionCard } from "@/shared/ui/section-card";

const summaryItems = [
  { label: "전체 경매", value: "24" },
  { label: "찜한 차", value: "8" },
  { label: "신규 채팅", value: "5" },
] as const;

export function HomeSummaryPanel() {
  return (
    <SectionCard
      title="운영 브리프"
      description="Flutter dealer home의 빠른 판단 흐름을 web 첫 화면에서도 유지하기 위한 상단 요약 영역입니다."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-line bg-slate-50 p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
