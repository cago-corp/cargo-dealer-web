import Link from "next/link";
import { DealerAuthVisualPanel } from "@/features/auth/components/dealer-auth-visual-panel";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

export function DealerFindIdPage() {
  return (
    <DealerAuthScaffold
      fullBleed
      mainClassName="px-0 py-0"
      footerContainerClassName="max-w-6xl"
      showFooter={false}
    >
      <section className="grid min-h-screen w-full flex-1 bg-slate-100 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DealerAuthVisualPanel />
        <div className="flex items-center justify-center bg-slate-100 px-6 py-10 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[560px] rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-panel">
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-500">계정 복구</p>
              <h1 className="text-2xl font-semibold text-slate-950">아이디 찾기</h1>
              <p className="text-sm leading-6 text-slate-600">
                딜러 웹 로그인 아이디는 가입 시 사용한 이메일입니다. 승인 요청에 사용한 이메일을
                우선 확인해 주세요.
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-violet-100 bg-violet-50/80 px-5 py-4 text-sm leading-6 text-violet-800">
              현재는 안내 화면입니다. 자동 아이디 조회 기능은 추후 실제 백엔드 연동 후
              제공됩니다.
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white px-6 py-6">
              <h2 className="text-base font-semibold text-slate-950">먼저 확인해보세요</h2>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span>가입 승인 메일이나 사내 메일함에서 `CARGO` 관련 이메일을 확인합니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span>딜러 계정은 보통 담당자 개인 메일이 아니라 업체 대표 메일로 등록돼 있습니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <span>그래도 확인이 어렵다면 고객센터 또는 내부 운영 담당자에게 문의해 주세요.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                href={appRoutes.login()}
              >
                로그인으로 돌아가기
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-line bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                href={appRoutes.findPassword()}
              >
                비밀번호 찾기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </DealerAuthScaffold>
  );
}
