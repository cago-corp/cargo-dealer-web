import Link from "next/link";
import { DealerLoginForm } from "@/features/auth/components/dealer-login-form";

export function DealerLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10">
      <section className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/60 bg-slate-950 px-8 py-10 text-white shadow-panel">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300">
            Cargo Dealer
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight">
            Flutter dealer 앱 기능을 웹 워크플로우 기준으로 다시 조립하는 시작점
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            로그인 이후 대시보드, 견적, 채팅, 마이페이지 흐름을 App Router 기준으로
            분리해 확장할 수 있도록 최소 골격을 먼저 준비했습니다.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <FeatureMarker label="Home" description="전체/찜한 차" />
            <FeatureMarker label="MY견적" description="입찰/거래 흐름" />
            <FeatureMarker label="Chat" description="페이지 또는 도크 확장" />
          </div>
        </div>
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Dealer Sign In</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            초기 로그인 연동
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            현재 로그인은 `shared/auth`의 backend adapter 뒤에서 동작합니다.
            Flutter dealer 앱의 Supabase 연결 정보를 재사용하되, 이후 Spring 전환 시
            feature UI와 route shell은 그대로 두고 adapter만 교체할 수 있게
            분리했습니다.
          </p>
          <div className="mt-8">
            <DealerLoginForm />
          </div>
          <p className="mt-6 text-sm text-slate-500">
            참고 라우트:
            {" "}
            <Link className="font-medium text-teal-700" href="/home">
              /home
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

type FeatureMarkerProps = {
  label: string;
  description: string;
};

function FeatureMarker({ label, description }: FeatureMarkerProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}
