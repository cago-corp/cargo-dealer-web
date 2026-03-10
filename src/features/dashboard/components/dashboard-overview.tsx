import { SectionCard } from "@/shared/ui/section-card";

const kpiItems = [
  { label: "오늘 신규 견적", value: "18", tone: "teal" },
  { label: "검토 중 입찰", value: "7", tone: "amber" },
  { label: "진행 중 채팅방", value: "12", tone: "slate" },
] as const;

export function DashboardOverview() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <SectionCard
        title="운영 브리프"
        description="딜러 홈은 Flutter의 화면 단위 복제가 아니라, 데스크톱에서 빠르게 판단할 수 있는 운영 요약판으로 재구성합니다."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {kpiItems.map((item) => (
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
      <SectionCard
        title="다음 구현 우선순위"
        description="Flutter dealer 모노레포의 feature 축을 web-native route와 query 중심으로 이어갑니다."
      >
        <ul className="space-y-3 text-sm text-slate-600">
          <li>인증/승인 상태에 따른 public/protected redirect 규칙 정의</li>
          <li>견적 목록과 상세의 schema, query key, invalidation 정책 연결</li>
          <li>채팅을 전체 페이지와 shell dock 중 어떤 모델로 갈지 문서화</li>
        </ul>
      </SectionCard>
    </div>
  );
}
