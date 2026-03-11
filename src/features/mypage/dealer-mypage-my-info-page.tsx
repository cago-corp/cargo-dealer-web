"use client";

import { useQuery } from "@tanstack/react-query";
import { dealerMyInfoQueryKey, fetchDealerMyInfo } from "@/features/mypage/lib/dealer-mypage-query";
import { LogoutButton } from "@/shared/ui/logout-button";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerMypageMyInfoPage() {
  const myInfoQuery = useQuery({
    queryKey: dealerMyInfoQueryKey,
    queryFn: fetchDealerMyInfo,
  });

  if (myInfoQuery.isLoading) {
    return <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (myInfoQuery.isError || !myInfoQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">내정보를 불러오지 못했습니다.</p>
      </section>
    );
  }

  const info = myInfoQuery.data;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">My Info</p>
        <h1 className="text-3xl font-semibold text-slate-950">내정보 관리</h1>
        <p className="text-sm text-slate-600">
          계정 정보와 업체 정보를 한 번에 확인하고, 변경이 필요한 항목을 점검할 수 있습니다.
        </p>
      </header>

      <SectionCard title="프로필">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold text-slate-400">
              {info.dealerName.slice(0, 1)}
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{info.dealerName} 님</p>
              <p className="mt-2 text-base font-semibold text-violet-700">
                {info.dealerNickname ?? "닉네임 미등록"}
              </p>
              <p className="mt-3 text-sm text-slate-500">
                가입일 {formatJoinedAt(info.joinedAt)}
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            프로필 사진 업로드 기능은 추후 연결됩니다.
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <SectionCard title="기본 정보" description="딜러 계정에서 바로 확인되는 항목입니다.">
            <div className="divide-y divide-slate-200">
              <InfoRow label="이름" value={info.dealerName} />
              <InfoRow label="닉네임" value={info.dealerNickname ?? "닉네임 미등록"} />
              <InfoRow label="휴대폰번호" value={info.phone ?? "전화번호 미등록"} />
              <InfoRow label="이메일" value={info.email ?? "이메일 미등록"} />
            </div>
          </SectionCard>

          <SectionCard title="업체 / 승인 정보" description="거래와 승인 상태에 직접 연결되는 정보입니다.">
            <div className="divide-y divide-slate-200">
              <InfoRow label="업체명" value={info.companyName} />
              <InfoRow
                label="모집인 등록번호"
                value={info.recruiterRegistrationNumber ?? "확인 필요"}
              />
              <InfoRow
                label="승인 상태"
                value={info.approvalStatus === "active" ? "승인 완료" : "승인 대기"}
                valueTone={info.approvalStatus === "active" ? "positive" : "warning"}
              />
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-4 xl:self-start">
          <SectionCard title="계정 액션" description="보안 및 계정 관련 작업은 여기에서 처리합니다.">
            <div className="space-y-3">
              <DisabledActionCard
                description="비밀번호 변경은 추후 실제 인증 절차와 함께 연결됩니다."
                title="비밀번호 변경"
              />
              <DisabledActionCard
                description="휴대폰 인증 및 업체 정보 변경 플로우는 추후 실제 제출과 연결됩니다."
                title="정보 수정 요청"
              />
            </div>
          </SectionCard>

          <SectionCard title="계정 관리">
            <div className="space-y-3">
              <LogoutButton
                className="text-left text-rose-600"
                variant="text"
              />
              <button
                className="w-full text-left text-sm font-medium text-slate-400"
                disabled
                type="button"
              >
                회원탈퇴 준비 중
              </button>
            </div>
          </SectionCard>
        </aside>
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  valueTone = "default",
}: {
  label: string;
  value: string;
  valueTone?: "default" | "positive" | "warning";
}) {
  const toneClassName = {
    default: "text-slate-950",
    positive: "text-emerald-700",
    warning: "text-amber-700",
  }[valueTone];

  return (
    <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-base font-semibold ${toneClassName}`}>{value}</p>
    </div>
  );
}

function DisabledActionCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 px-4 py-4">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function formatJoinedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
