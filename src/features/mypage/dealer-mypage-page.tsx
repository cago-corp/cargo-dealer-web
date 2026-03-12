"use client";

import Link from "next/link";
import { useDealerProfileQuery } from "@/features/mypage/hooks/use-dealer-profile-query";
import { appRoutes } from "@/shared/config/routes";
import { LogoutButton } from "@/shared/ui/logout-button";
const whiteSectionClassName = "-mx-4 bg-white sm:-mx-5 lg:-mx-8";
const whiteSectionInnerClassName = "px-4 py-3.5 sm:px-5 sm:py-4 lg:px-8";
const desktopSectionDividerClassName = "xl:border-t xl:border-slate-200";

export function DealerMypagePage() {
  const profileQuery = useDealerProfileQuery();

  if (profileQuery.isLoading) {
    return <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">
          마이페이지 정보를 불러오지 못했습니다.
        </p>
      </section>
    );
  }

  const profile = profileQuery.data;

  return (
    <section className="space-y-3.5 sm:space-y-4 xl:space-y-0">
      <section className={whiteSectionClassName}>
        <div className={whiteSectionInnerClassName}>
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">마이페이지</h1>
          <Link
            className="mt-4 flex items-center justify-between gap-4 sm:mt-5"
            href={appRoutes.mypageMyInfo()}
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-400 sm:h-14 sm:w-14 sm:text-2xl">
                {profile.dealerName.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                  {profile.dealerName} 님
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-violet-700">
                  {profile.dealerNickname ?? "딜러 닉네임 없음"}
                </p>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">내정보 관리</p>
              </div>
            </div>
            <span className="shrink-0 text-2xl leading-none text-slate-300 sm:text-3xl">›</span>
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-5 sm:gap-5">
            <QuickActionCard
              accentTone="primary"
              badgeText={null}
              href={appRoutes.mypageArchive()}
              icon="archive"
              label="거래 아카이브"
            />
            <QuickActionCard
              accentTone="secondary"
              badgeText="!"
              href={appRoutes.mypageReview()}
              icon="review"
              label="리뷰 관리"
            />
          </div>
        </div>
      </section>

      <Link
        className={`${whiteSectionClassName} ${desktopSectionDividerClassName} block transition hover:bg-slate-50`}
        href={appRoutes.mypageInterestedVehicles()}
      >
        <div className={`${whiteSectionInnerClassName} flex items-center justify-between gap-4`}>
          <div>
            <h2 className="text-base font-semibold text-slate-950">관심차량보기</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              관심차량으로 설정해두면 경매 시작시 알림을 받을 수 있어요.
            </p>
          </div>
          <span className="text-2xl leading-none text-slate-300">›</span>
        </div>
      </Link>

      <section className={`${whiteSectionClassName} ${desktopSectionDividerClassName} space-y-3`}>
        <div className={whiteSectionInnerClassName}>
          <p className="text-sm font-semibold text-slate-950">설정</p>
          <div className="space-y-0">
            <SettingLink href={appRoutes.mypageNotificationSettings()} label="알림 설정" />
            <SettingLink href={appRoutes.mypageTerms()} label="이용약관" />
            <SettingLink href={appRoutes.mypageCustomerService()} label="고객센터" />
            <SettingLink href={appRoutes.mypageAnnouncements()} label="공지사항" />
            <div className="border-t border-slate-200 pt-4">
              <LogoutButton className="text-left text-rose-600" variant="text" />
            </div>
          </div>
        </div>
      </section>

      <section className={`${whiteSectionClassName} ${desktopSectionDividerClassName}`}>
        <div className={whiteSectionInnerClassName}>
          <p className="text-sm text-slate-500">참여 딜러 전용 혜택</p>
          <h2 className="mt-1.5 text-xl font-semibold text-slate-950 sm:text-2xl">수수료 할인 혜택</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 sm:mt-2">
            진행 중인 입찰과 거래 수에 따라 적용 가능한 혜택이 달라집니다.
          </p>
        </div>
      </section>
    </section>
  );
}

function QuickActionCard({
  label,
  href,
  accentTone,
  badgeText,
  icon,
}: {
  label: string;
  href: string;
  accentTone: "primary" | "secondary";
  badgeText: string | null;
  icon: "archive" | "review";
}) {
  const toneClassName =
    accentTone === "primary" ? "text-violet-700 bg-violet-50" : "text-sky-700 bg-sky-50";

  return (
    <Link
      className="transition hover:opacity-80"
      href={href}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${toneClassName} sm:h-10 sm:w-10`}
        >
          {icon === "archive" ? <ArchiveIcon /> : <ReviewIcon />}
          {badgeText ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold text-white">
              {badgeText}
            </span>
          ) : null}
        </div>
        <span className="text-sm font-semibold text-slate-950 sm:text-base">{label}</span>
      </div>
    </Link>
  );
}

function ArchiveIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 7h14v11.5A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5V7Zm2-3h10a1.5 1.5 0 0 1 1.5 1.5V7h-13V5.5A1.5 1.5 0 0 1 7 4Zm2.5 8.5h5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 17.5h10M7 12h10M7 6.5h6M5 3.5h14A1.5 1.5 0 0 1 20.5 5v14A1.5 1.5 0 0 1 19 20.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function SettingLink({ href, label }: { href: string; label: string }) {
  return (
    <Link className="flex items-center justify-between gap-4 py-4" href={href}>
      <span className="text-base font-semibold text-slate-950 sm:text-lg">{label}</span>
      <span className="text-3xl leading-none text-slate-300">›</span>
    </Link>
  );
}
