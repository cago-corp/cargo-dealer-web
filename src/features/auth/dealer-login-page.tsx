import Link from "next/link";
import { DealerAuthVisualPanel } from "@/features/auth/components/dealer-auth-visual-panel";
import { DealerLoginForm } from "@/features/auth/components/dealer-login-form";
import { DealerAuthScaffold } from "@/features/auth/dealer-auth-scaffold";
import { appRoutes } from "@/shared/config/routes";
import { SiteFooter } from "@/shared/ui/site-footer";

export function DealerLoginPage() {
  return (
    <DealerAuthScaffold
      fullBleed
      mainClassName="px-0 py-0"
      footerContainerClassName="max-w-6xl"
      showFooter={false}
    >
      <section className="grid min-h-screen w-full flex-1 bg-slate-100 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DealerAuthVisualPanel />
        <div className="flex min-h-screen flex-col bg-slate-100">
          <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
            <div className="mx-auto w-full max-w-[560px] rounded-[32px] border border-white/70 bg-white/92 p-8 shadow-panel">
              <p className="text-sm font-medium text-slate-500">딜러 계정 로그인</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                로그인
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                등록된 딜러 계정으로 로그인하고 현재 진행 중인 경매와 거래를 확인하세요.
              </p>
              <div className="mt-8">
                <DealerLoginForm />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <p>승인 완료 계정은 로그인 후 바로 경매장 홈으로 이동합니다.</p>
                <Link
                  className="font-medium text-slate-700 underline-offset-4 hover:underline"
                  href={appRoutes.signupTerms()}
                >
                  회원가입 시작
                </Link>
              </div>
            </div>
          </div>
          <SiteFooter containerClassName="max-w-full" />
        </div>
      </section>
    </DealerAuthScaffold>
  );
}
