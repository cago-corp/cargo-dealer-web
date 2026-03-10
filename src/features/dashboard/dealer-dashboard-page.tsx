import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export function DealerDashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">Dealer 운영 대시보드</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          최소 골격 단계에서는 웹 전용 shell과 기능 경계가 먼저입니다. 실제 수치와
          권한 정책은 이후 API 계약에 맞춰 연결합니다.
        </p>
      </header>
      <DashboardOverview />
    </section>
  );
}
