import Link from "next/link";
import Image from "next/image";
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
      <section className="relative min-h-screen w-full flex-1 overflow-hidden bg-[linear-gradient(180deg,#6d28d9_0%,#5b21b6_42%,#4c1d95_100%)] lg:grid lg:bg-slate-100 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)] lg:hidden" />

        <div className="hidden lg:block">
          <DealerAuthVisualPanel />
        </div>

        <div className="relative z-10 flex min-h-screen w-full flex-col bg-transparent lg:bg-slate-100">
          <div className="relative flex flex-1 items-center justify-center px-5 pb-28 pt-8 sm:px-6 sm:pb-32 sm:pt-10 md:px-8 md:pt-12 lg:px-12 lg:pb-10 lg:pt-10 2xl:px-16">
            <div className="relative z-10 mx-auto w-full max-w-[560px]">
              <div className="mb-6 text-center text-white lg:hidden">
                <Image
                  alt="CARGO 로고"
                  className="mx-auto h-auto w-[168px] drop-shadow-[0_10px_18px_rgba(15,23,42,0.18)] sm:w-[180px]"
                  height={178}
                  priority
                  src="/images/dealer-login-logo.png"
                  width={623}
                />
                <p className="mx-auto mt-5 max-w-[420px] text-xl font-semibold leading-[1.45] tracking-[-0.02em] text-white sm:text-2xl">
                  우리는 오직 견적만으로 싸운다.
                  <br />
                  대체 불가능한 조건으로 시장을 선점하라!
                </p>
              </div>

              <div className="rounded-[32px] border border-white/80 bg-white p-7 shadow-panel sm:p-8 lg:border-white/70 lg:bg-white/92">
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
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 lg:hidden">
              <div className="relative mx-auto aspect-[1.72/1] w-[112%] max-w-none">
                <Image
                  alt="CARGO 로그인 차량 이미지"
                  className="absolute -bottom-6 left-1/2 h-auto w-[104%] max-w-none -translate-x-1/2 object-contain object-bottom sm:-bottom-10"
                  height={1088}
                  priority
                  src="/images/dealer-login-hero.png"
                  width={1560}
                />
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <SiteFooter containerClassName="max-w-full" />
          </div>
        </div>
      </section>
    </DealerAuthScaffold>
  );
}
