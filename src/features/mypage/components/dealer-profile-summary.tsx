import type { DealerProfile } from "@/entities/dealer/schemas/dealer-profile-schema";
import { SectionCard } from "@/shared/ui/section-card";

type DealerProfileSummaryProps = {
  profile: DealerProfile;
};

export function DealerProfileSummary({ profile }: DealerProfileSummaryProps) {
  const approvalStatusLabel =
    profile.approvalStatus === "active" ? "운영 가능" : "승인 대기";

  return (
    <SectionCard
      title="딜러 계정 개요"
      description="기본 계정 정보와 승인 상태를 확인하세요."
    >
      <dl className="grid gap-4 md:grid-cols-2">
        <ProfileRow label="상호명" value={profile.companyName} />
        <ProfileRow label="대표자" value={profile.ownerName} />
        <ProfileRow label="승인 상태" value={approvalStatusLabel} />
        <ProfileRow label="지점 수" value={`${profile.branchCount}개`} />
      </dl>
    </SectionCard>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
};

function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
