import Link from "next/link";
import { DealerAuthVisualPanel } from "@/features/auth/components/dealer-auth-visual-panel";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";

export function DealerFindPasswordPage() {
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
              <h1 className="text-2xl font-semibold text-slate-950">비밀번호 찾기</h1>
              <p className="text-sm leading-6 text-slate-600">
                현재는 재설정 메일 자동 발송 대신 안내 화면을 제공합니다. 가입한 이메일을 알고
                있다면 운영자 또는 고객센터를 통해 계정 복구를 진행해 주세요.
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
              현재는 데모 연결 화면입니다. 실제 비밀번호 재설정 기능은 추후 백엔드 연동 후
              제공됩니다.
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-white px-6 py-6">
              <h2 className="text-base font-semibold text-slate-950">복구 전 확인 사항</h2>
              <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    1
                  </span>
                  <span>가입 승인에 사용한 이메일 주소를 먼저 확인합니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    2
                  </span>
                  <span>운영 담당자 또는 고객센터에 계정 복구가 필요하다고 전달합니다.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    3
                  </span>
                  <span>복구 후에는 로그인 페이지에서 새 비밀번호로 다시 로그인합니다.</span>
                </li>
              </ol>
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
                href={appRoutes.findId()}
              >
                아이디 찾기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </DealerAuthScaffold>
  );
}
