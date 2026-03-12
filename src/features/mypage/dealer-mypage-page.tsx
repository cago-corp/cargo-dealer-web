"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DealerProfileSummary } from "@/features/mypage/components/dealer-profile-summary";
import { useDealerProfileQuery } from "@/features/mypage/hooks/use-dealer-profile-query";
import {
  dealerInterestedVehiclesQueryKey,
  fetchDealerInterestedVehicles,
} from "@/features/mypage/lib/dealer-mypage-query";
import { appRoutes } from "@/shared/config/routes";
import { LogoutButton } from "@/shared/ui/logout-button";

const sectionDividerClassName = "h-3 w-full rounded-full bg-slate-100";

export function DealerMypagePage() {
  const profileQuery = useDealerProfileQuery();
  const interestedVehiclesQuery = useQuery({
    queryKey: dealerInterestedVehiclesQueryKey,
    queryFn: fetchDealerInterestedVehicles,
  });

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
  const interestedVehicleCount = interestedVehiclesQuery.data?.length ?? 0;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
          My Page
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">마이페이지</h1>
      </header>

      <section className="rounded-[32px] bg-white px-6 py-6 shadow-sm">
        <Link
          className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          href={appRoutes.mypageMyInfo()}
        >
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold text-slate-400">
              {profile.dealerName.slice(0, 1)}
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{profile.dealerName} 님</p>
              <p className="mt-2 text-lg font-semibold text-violet-700">
                {profile.dealerNickname ?? "딜러 닉네임 없음"}
              </p>
              <p className="mt-3 text-sm text-slate-500">내정보 관리</p>
            </div>
          </div>
          <span className="self-end text-3xl leading-none text-slate-300 lg:self-center">›</span>
        </Link>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
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
      </section>

      <div className={sectionDividerClassName} />

      <Link
        className="block rounded-[32px] bg-white px-6 py-6 shadow-sm transition hover:bg-slate-50"
        href={appRoutes.mypageInterestedVehicles()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">관심차량보기</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              관심차량으로 설정해두면 경매 시작시 알림을 받을 수 있어요.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {interestedVehicleCount}건
            </span>
            <span className="text-3xl leading-none text-slate-300">›</span>
          </div>
        </div>
      </Link>

      <div className={sectionDividerClassName} />

      <section className="rounded-[32px] bg-white px-6 py-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">설정</p>
        <div className="mt-6 space-y-7">
          <SettingLink href={appRoutes.mypageNotificationSettings()} label="알림 설정" />
          <SettingLink href={appRoutes.mypageTerms()} label="이용약관" />
          <SettingLink href={appRoutes.mypageCustomerService()} label="고객센터" />
          <SettingLink href={appRoutes.mypageAnnouncements()} label="공지사항" />
          <SettingStaticRow
            description="웹에서는 브라우저 확대 설정을 우선 사용합니다."
            label="큰 글씨 모드"
            valueLabel="준비 중"
          />
          <div className="border-t border-slate-200 pt-5">
            <LogoutButton className="text-left text-rose-600" variant="text" />
          </div>
        </div>
      </section>

      <DealerProfileSummary profile={profile} />

      <section className="rounded-[32px] bg-slate-100 px-6 py-6">
        <p className="text-sm text-slate-500">참여 딜러 전용 혜택</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">수수료 할인 혜택</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          진행 중인 입찰과 거래 수에 따라 적용 가능한 혜택이 달라집니다.
        </p>
      </section>

      <p className="text-sm text-slate-500">웹 버전 0.1.0</p>
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
      className="rounded-[28px] bg-white px-5 py-5 shadow-sm transition hover:bg-slate-50"
      href={href}
    >
      <div className="flex items-center gap-3">
        <div
          className={`relative flex h-11 w-11 items-center justify-center rounded-2xl ${toneClassName}`}
        >
          {icon === "archive" ? <ArchiveIcon /> : <ReviewIcon />}
          {badgeText ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold text-white">
              {badgeText}
            </span>
          ) : null}
        </div>
        <span className="text-lg font-semibold text-slate-950">{label}</span>
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
    <Link className="flex items-center justify-between gap-4" href={href}>
      <span className="text-lg font-semibold text-slate-950">{label}</span>
      <span className="text-3xl leading-none text-slate-300">›</span>
    </Link>
  );
}

function SettingStaticRow({
  label,
  valueLabel,
  description,
}: {
  label: string;
  valueLabel: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-lg font-semibold text-slate-950">{label}</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {valueLabel}
      </span>
    </div>
  );
}
