type SiteFooterProps = Readonly<{
  containerClassName?: string;
}>;

export function SiteFooter({
  containerClassName = "max-w-[1680px]",
}: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/90">
      <div
        className={`mx-auto w-full ${containerClassName} px-6 py-7 text-xs leading-6 text-slate-500`}
      >
        <p className="font-semibold text-slate-600">Cargo Co., Ltd.</p>
        <p>
          대표: 한창훈 | 사업자등록번호: 000-00-00000 | 통신판매업신고:
          2026-서울강남-00000
        </p>
        <p>
          주소: 서울특별시 강남구 테헤란로 000, 00층 | 대표번호: 02-0000-0000 |
          이메일: dealer@cargo.example
        </p>
        <p className="mt-2 text-[11px] text-slate-400">
          Copyright © Cargo Co., Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
