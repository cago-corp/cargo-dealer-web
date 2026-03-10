import Link from "next/link";
import { appRoutes } from "@/shared/config/routes";
import { SectionCard } from "@/shared/ui/section-card";

type DealerMypagePlaceholderPageProps = {
  description: string;
  title: string;
};

export function DealerMypagePlaceholderPage({
  description,
  title,
}: DealerMypagePlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionCard title={title} description={description}>
        <div className="rounded-[28px] bg-slate-50 px-6 py-12 text-center">
          <p className="text-lg font-semibold text-slate-950">
            이 메뉴는 곧 사용할 수 있습니다.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            현재는 마이페이지 허브에서 다른 주요 메뉴를 먼저 확인할 수 있습니다.
          </p>
        </div>
      </SectionCard>

      <Link
        className="block rounded-2xl border border-line px-4 py-3 text-center text-sm font-medium text-slate-700"
        href={appRoutes.mypage()}
      >
        마이페이지로 돌아가기
      </Link>
    </section>
  );
}
