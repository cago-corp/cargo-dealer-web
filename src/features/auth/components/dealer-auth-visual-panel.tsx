import Image from "next/image";

export function DealerAuthVisualPanel() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#6d28d9_0%,#5b21b6_42%,#4c1d95_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="relative flex h-full min-h-[640px] flex-col justify-between px-8 py-10 text-white lg:px-12 lg:py-12">
        <div className="flex-1" />

        <div className="mx-auto flex w-full max-w-[520px] flex-col items-center text-center">
          <Image
            alt="CARGO 로고"
            className="h-auto w-[220px] drop-shadow-[0_12px_18px_rgba(15,23,42,0.18)]"
            height={178}
            priority
            src="/images/dealer-login-logo.png"
            width={623}
          />
          <p className="mt-10 text-3xl font-semibold leading-[1.45] tracking-[-0.02em] text-white">
            우리는 오직 견적만으로 싸운다.
            <br />
            대체 불가능한 조건으로 시장을 선점하라!
          </p>
        </div>

        <div className="relative mt-10 -mx-8 w-[calc(100%+4rem)] lg:-mx-12 lg:w-[calc(100%+6rem)]">
          <div className="relative aspect-[1.7/1] w-full">
            <Image
              alt="CARGO 로그인 차량 이미지"
              className="absolute -bottom-20 left-1/2 h-auto w-[105%] max-w-none -translate-x-1/2 object-contain object-bottom lg:-bottom-24"
              height={1088}
              priority
              src="/images/dealer-login-hero.png"
              width={1560}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
