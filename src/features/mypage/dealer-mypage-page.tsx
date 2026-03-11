"use client";

import Link from "next/link";
import { DealerProfileSummary } from "@/features/mypage/components/dealer-profile-summary";
import { useDealerProfileQuery } from "@/features/mypage/hooks/use-dealer-profile-query";
import { appRoutes } from "@/shared/config/routes";
import { LogoutButton } from "@/shared/ui/logout-button";

export function DealerMypagePage() {
  const profileQuery = useDealerProfileQuery();

  if (profileQuery.isLoading) {
    return <div className="h-[480px] animate-pulse rounded-[32px] bg-slate-100" />;
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
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            My Page
          </p>
          <h1 className="text-3xl font-semibold text-slate-950">마이 페이지</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            계정 정보와 자주 쓰는 메뉴를 한 곳에서 확인할 수 있습니다.
          </p>
        </div>
        <Link
          className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700"
          href={appRoutes.mypageNotifications()}
        >
          알림 보기
        </Link>
      </header>

      <section className="rounded-[32px] border border-white/80 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-slate-950 text-3xl font-semibold text-white">
              {profile.dealerName.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm text-slate-500">{profile.companyName}</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                {profile.dealerName} 님
              </h2>
              <p className="mt-2 text-base font-medium text-teal-700">
                {profile.dealerNickname ?? "딜러 닉네임 없음"}
              </p>
            </div>
          </div>
          <Link
            className="inline-flex rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700"
            href={appRoutes.mypageMyInfo()}
          >
            내정보 관리
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickActionCard
          description="제출한 입찰 상태를 바로 확인할 수 있습니다."
          href={appRoutes.bids()}
          label="나의 입찰"
        />
        <QuickActionCard
          description="리뷰 관련 메뉴를 빠르게 확인할 수 있습니다."
          href={appRoutes.mypageReview()}
          label="리뷰 관리"
        />
      </div>

      <Link
        className="block rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm transition hover:border-slate-300"
        href={appRoutes.mypageInterestedVehicles()}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">관심 차량 보기</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              관심 차량으로 등록한 모델과 알림 대상을 한눈에 확인할 수 있습니다.
            </p>
          </div>
          <span className="text-2xl text-slate-400">›</span>
        </div>
      </Link>

      <section className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
          Settings
        </p>
        <div className="mt-6 space-y-5">
          <SettingLink href={appRoutes.mypageNotificationSettings()} label="알림 설정" />
          <SettingLink href={appRoutes.mypageTerms()} label="이용약관" />
          <SettingLink href={appRoutes.mypageCustomerService()} label="고객센터" />
          <SettingLink href={appRoutes.mypageAnnouncements()} label="공지사항" />
          <div className="border-t border-slate-200 pt-5">
            <LogoutButton
              className="flex w-full items-center justify-start rounded-2xl border-slate-200 text-left text-rose-600 hover:bg-rose-50"
              variant="light"
            />
          </div>
        </div>
      </section>

      <DealerProfileSummary profile={profile} />

      <section className="rounded-[32px] bg-slate-100 px-6 py-6">
        <p className="text-sm text-slate-500">참여 딜러 전용 혜택</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
          수수료 할인 혜택
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          진행 중인 입찰과 거래 수에 따라 적용 가능한 혜택이 달라집니다.
        </p>
      </section>

      <p className="text-sm text-slate-500">웹 버전 0.1.0</p>
    </section>
  );
}

type QuickActionCardProps = {
  description: string;
  href: string;
  label: string;
};

function QuickActionCard({ description, href, label }: QuickActionCardProps) {
  return (
    <Link
      className="rounded-[32px] border border-line bg-white px-6 py-6 shadow-sm transition hover:border-slate-300"
      href={href}
    >
      <p className="text-lg font-semibold text-slate-950">{label}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}

type SettingLinkProps = {
  href: string;
  label: string;
};

function SettingLink({ href, label }: SettingLinkProps) {
  return (
    <Link
      className="flex items-center justify-between gap-4 rounded-2xl px-1 py-1 text-lg font-semibold text-slate-950"
      href={href}
    >
      <span>{label}</span>
      <span className="text-2xl text-slate-400">›</span>
    </Link>
  );
}
