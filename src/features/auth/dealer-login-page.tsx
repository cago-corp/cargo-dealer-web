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
            경매부터 거래까지 한 화면에서 관리하는 딜러 센터
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            로그인 후 경매장 홈, 찜한 차, 내 입찰, 내 거래, 마이 페이지로 바로 이동할 수 있습니다.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <FeatureMarker label="경매장 홈" description="실시간 경매 확인" />
            <FeatureMarker label="내 거래" description="상태별 진행 관리" />
            <FeatureMarker label="채팅" description="우측 고정 레일 운영" />
          </div>
        </div>
        <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur">
          <p className="text-sm font-medium text-slate-500">Dealer Sign In</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            로그인
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            등록된 딜러 계정으로 로그인하고 현재 진행 중인 경매와 거래를 확인하세요.
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
