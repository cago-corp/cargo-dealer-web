"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DealerCompanyNameUpdate,
  DealerMyInfo,
  DealerNicknameUpdate,
  DealerPasswordChange,
  DealerPhoneUpdate,
  DealerRecruiterRegistrationUpdate,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import {
  dealerCompanyNameUpdateSchema,
  dealerMyInfoSchema,
  dealerNicknameUpdateSchema,
  dealerPasswordChangeSchema,
  dealerPhoneUpdateSchema,
  dealerRecruiterRegistrationUpdateSchema,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import { changeDealerPasswordFromApi } from "@/features/mypage/lib/dealer-mypage-api";
import {
  dealerMyInfoQueryKey,
  dealerProfileQueryKey,
  fetchDealerMyInfo,
  updateDealerNickname,
} from "@/features/mypage/lib/dealer-mypage-query";
import { LogoutButton } from "@/shared/ui/logout-button";
import { SectionCard } from "@/shared/ui/section-card";

type EditableField = "nickname" | "phone" | "company" | "recruiter" | "password";

const mobileSectionClassName =
  "-mx-4 bg-white px-4 py-4 sm:-mx-5 sm:px-5 lg:-mx-8 lg:px-8 xl:hidden";
const mobileSectionDividerClassName = "-mx-4 h-3 bg-slate-100 sm:-mx-5 lg:-mx-8 xl:hidden";

function formatJoinedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatPhoneDisplay(value: string | null) {
  if (!value) {
    return "전화번호 미등록";
  }

  const digits = value.replaceAll(/\D/g, "");
  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatPhoneInput(value: string) {
  const digits = value.replaceAll(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatRecruiterRegistrationInput(value: string) {
  const digits = value.replaceAll(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function buildProfilePatch(info: DealerMyInfo) {
  return {
    dealerName: info.dealerName,
    dealerNickname: info.dealerNickname,
    companyName: info.companyName,
  };
}

export function DealerMypageMyInfoPage() {
  const queryClient = useQueryClient();
  const myInfoQuery = useQuery({
    queryKey: dealerMyInfoQueryKey,
    queryFn: fetchDealerMyInfo,
  });
  const [activeField, setActiveField] = useState<EditableField | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const saveNicknameMutation = useMutation({
    mutationFn: updateDealerNickname,
    onSuccess: (nextInfo) => {
      queryClient.setQueryData<DealerMyInfo>(dealerMyInfoQueryKey, dealerMyInfoSchema.parse(nextInfo));
      queryClient.setQueryData(dealerProfileQueryKey, (current: unknown) => {
        if (!current || typeof current !== "object") {
          return current;
        }

        return {
          ...(current as Record<string, unknown>),
          ...buildProfilePatch(nextInfo),
        };
      });
      setActiveField(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changeDealerPasswordFromApi,
    onSuccess: ({ redirectTo }) => {
      window.location.assign(redirectTo);
    },
  });

  const info = myInfoQuery.data ?? null;

  if (myInfoQuery.isLoading) {
    return <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (myInfoQuery.isError || !info) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">내정보를 불러오지 못했습니다.</p>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="hidden text-sm font-medium uppercase tracking-[0.18em] text-teal-700 xl:block">
            My Info
          </p>
          <h1 className="text-2xl font-semibold text-slate-950 xl:text-3xl">내정보 관리</h1>
          <p className="hidden text-sm text-slate-600 xl:block">
            계정 정보와 업체 정보를 확인하고 수정합니다.
          </p>
        </header>

        {statusMessage ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        {saveNicknameMutation.error instanceof Error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {saveNicknameMutation.error.message}
          </div>
        ) : null}

        {changePasswordMutation.error instanceof Error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {changePasswordMutation.error.message}
          </div>
        ) : null}

        <div className="space-y-0 xl:space-y-6">
          <section className={mobileSectionClassName}>
            <div className="flex items-center gap-4">
              <button
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold text-slate-400 transition hover:bg-slate-200"
                type="button"
                onClick={() => {
                  setStatusMessage("프로필 사진 등록 기능은 준비 중입니다.");
                }}
              >
                {info.dealerName.slice(0, 1)}
                <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-sm">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.1-1.3c.28-.34.7-.53 1.14-.53h2.38c.44 0 .86.2 1.14.53L15.5 6h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8ZM12 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-2xl font-semibold text-slate-950">
                  {info.dealerName} 님
                </p>
                <p className="mt-1 truncate text-xl font-semibold text-violet-700">
                  {info.dealerNickname ?? "닉네임 미등록"}
                </p>
                <p className="mt-2 text-sm text-slate-500">가입일 {formatJoinedAt(info.joinedAt)}</p>
              </div>
            </div>
          </section>

          <section className={mobileSectionClassName}>
            <div className="divide-y divide-slate-200">
              <MyInfoRow label="이름" value={info.dealerName} />
              <MyInfoRow
                canEdit
                label="닉네임"
                value={info.dealerNickname ?? "닉네임 미등록"}
                onClick={() => setActiveField("nickname")}
              />
              <MyInfoRow
                canEdit
                label="휴대폰번호"
                value={formatPhoneDisplay(info.phone)}
                onClick={() => setActiveField("phone")}
              />
              <MyInfoRow
                canEdit
                label="업체명"
                value={info.companyName}
                onClick={() => setActiveField("company")}
              />
              <MyInfoRow
                canEdit
                description="모집인 번호가 없으면 할부, 리스 견적을 입찰할 수 없습니다."
                label="모집인 등록번호"
                value={info.recruiterRegistrationNumber ?? "확인 필요"}
                valueTone={info.recruiterRegistrationNumber ? "default" : "muted"}
                onClick={() => setActiveField("recruiter")}
              />
              <MyInfoActionRow label="비밀번호 변경" onClick={() => setActiveField("password")} />
            </div>
          </section>

          <div className={mobileSectionDividerClassName} />

          <section className={mobileSectionClassName}>
            <div className="divide-y divide-slate-200">
              <div className="py-4">
                <LogoutButton className="text-left text-slate-950" variant="text" />
              </div>
              <MyInfoActionRow
                label="회원탈퇴"
                onClick={() => {
                  setStatusMessage("회원탈퇴 기능은 준비 중입니다.");
                }}
              />
            </div>
          </section>

          <section className="hidden xl:block">
            <SectionCard title="프로필">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <button
                    className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold text-slate-400 transition hover:bg-slate-200"
                    type="button"
                    onClick={() => {
                      setStatusMessage("프로필 사진 등록 기능은 준비 중입니다.");
                    }}
                  >
                    {info.dealerName.slice(0, 1)}
                    <span className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-sm">
                      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2.1l1.1-1.3c.28-.34.7-.53 1.14-.53h2.38c.44 0 .86.2 1.14.53L15.5 6h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8ZM12 9a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.7"
                        />
                      </svg>
                    </span>
                  </button>
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
                <div className="text-sm leading-6 text-slate-500">
                  프로필 사진 업로드는 추후 연결됩니다.
                </div>
              </div>
            </SectionCard>
          </section>

          <section className="hidden xl:block">
            <SectionCard title="기본 정보">
              <div className="divide-y divide-slate-200">
                <MyInfoRow label="이름" value={info.dealerName} />
              <MyInfoRow
                canEdit
                label="닉네임"
                value={info.dealerNickname ?? "닉네임 미등록"}
                onClick={() => setActiveField("nickname")}
              />
              <MyInfoRow
                canEdit
                label="휴대폰번호"
                value={formatPhoneDisplay(info.phone)}
                onClick={() => setActiveField("phone")}
              />
              </div>
            </SectionCard>
          </section>

          <section className="hidden xl:block">
            <SectionCard title="업체 정보">
              <div className="divide-y divide-slate-200">
                <MyInfoRow
                  canEdit
                  label="업체명"
                  value={info.companyName}
                  onClick={() => setActiveField("company")}
                />
                <MyInfoRow
                  canEdit
                  description="모집인 번호가 없으면 할부, 리스 견적을 입찰할 수 없습니다."
                  label="모집인 등록번호"
                  value={info.recruiterRegistrationNumber ?? "확인 필요"}
                  valueTone={info.recruiterRegistrationNumber ? "default" : "muted"}
                  onClick={() => setActiveField("recruiter")}
                />
              </div>
            </SectionCard>
          </section>

          <section className="hidden xl:block">
            <SectionCard title="보안">
              <PasswordActionRow onClick={() => setActiveField("password")} />
            </SectionCard>
          </section>

          <section className="hidden xl:block">
            <SectionCard title="계정 관리">
              <div className="space-y-4">
                <LogoutButton className="text-left text-rose-600" variant="text" />
                <button
                  className="text-left text-sm font-medium text-slate-400 transition hover:text-slate-600"
                  type="button"
                  onClick={() => {
                    setStatusMessage("회원탈퇴 기능은 준비 중입니다.");
                  }}
                >
                  회원탈퇴
                </button>
              </div>
            </SectionCard>
          </section>
        </div>
      </section>

      {activeField === "nickname" ? (
        <NicknameEditModal
          initialNickname={info.dealerNickname ?? ""}
          isBusy={saveNicknameMutation.isPending}
          onClose={() => setActiveField(null)}
          onSave={async (payload) => {
            await saveNicknameMutation.mutateAsync(payload);
            setStatusMessage("닉네임이 변경되었습니다.");
          }}
        />
      ) : null}

      {activeField === "phone" ? (
        <PhoneEditModal
          initialPhone={info.phone ?? ""}
          isBusy={false}
          onClose={() => setActiveField(null)}
          onSave={async (_payload) => {
            setActiveField(null);
            setStatusMessage("휴대폰 본인 인증 기능은 준비 중입니다. 앱과 같은 인증 진입 플로우로 추후 교체합니다.");
          }}
        />
      ) : null}

      {activeField === "company" ? (
        <CompanyEditModal
          initialCompanyName={info.companyName}
          isBusy={false}
          onClose={() => setActiveField(null)}
          onSave={async (_payload) => {
            setActiveField(null);
            setStatusMessage("업체 정보 변경 신청 기능은 준비 중입니다. 운영 정책과 제출 API가 확정되면 연결합니다.");
          }}
        />
      ) : null}

      {activeField === "recruiter" ? (
        <RecruiterEditModal
          initialRegistrationNumber={info.recruiterRegistrationNumber ?? ""}
          isBusy={false}
          onClose={() => setActiveField(null)}
          onSave={async (_payload) => {
            setActiveField(null);
            setStatusMessage("모집인 정보 변경 신청 기능은 준비 중입니다. 운영 정책과 제출 API가 확정되면 연결합니다.");
          }}
        />
      ) : null}

      {activeField === "password" ? (
        <PasswordEditModal
          isBusy={changePasswordMutation.isPending}
          onClose={() => setActiveField(null)}
          onSave={async (payload) => {
            await changePasswordMutation.mutateAsync(payload);
          }}
        />
      ) : null}
    </>
  );
}

function MyInfoRow({
  label,
  value,
  onClick,
  canEdit = false,
  description,
  valueTone = "default",
}: {
  label: string;
  value: string;
  onClick?: () => void;
  canEdit?: boolean;
  description?: string;
  valueTone?: "default" | "muted" | "positive" | "warning";
}) {
  const toneClassName = {
    default: "text-slate-950",
    muted: "text-slate-400",
    positive: "text-emerald-700",
    warning: "text-amber-700",
  }[valueTone];

  return (
    <button
      className="flex w-full items-center gap-4 py-4 text-left disabled:cursor-default"
      disabled={!canEdit}
      type="button"
      onClick={onClick}
    >
      <div className="flex-1">
        <p className="text-sm text-slate-500">{label}</p>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        ) : null}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <p className={`text-base font-semibold ${toneClassName}`}>{value}</p>
        {canEdit ? <span className="text-2xl leading-none text-slate-300">›</span> : null}
      </div>
    </button>
  );
}

function MyInfoActionRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="flex w-full items-center justify-between gap-4 py-4 text-left"
      type="button"
      onClick={onClick}
    >
      <span className="text-base font-semibold text-slate-950">{label}</span>
      <span className="text-2xl leading-none text-slate-300">›</span>
    </button>
  );
}

function PasswordActionRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-slate-950">비밀번호</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          변경 후에는 다시 로그인해야 합니다.
        </p>
      </div>
      <button
        className="rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        type="button"
        onClick={onClick}
      >
        비밀번호 변경
      </button>
    </div>
  );
}

function FormModalShell({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 sm:pt-24"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="mt-0 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {description ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            type="button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function TextField({
  value,
  placeholder,
  type = "text",
  error,
  helperText,
  onChange,
}: {
  value: string;
  placeholder: string;
  type?: "text" | "tel";
  error?: string | null;
  helperText?: string;
  onChange: (nextValue: string) => void;
}) {
  return (
    <div className="space-y-2">
      <input
        className={
          error
            ? "min-h-12 w-full rounded-2xl border border-rose-300 bg-white px-4 text-sm text-slate-950 outline-none"
            : "min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-slate-400"
        }
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}

function FilePickRow({
  label,
  description,
  fileName,
  onPick,
}: {
  label: string;
  description: string;
  fileName: string | null;
  onPick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <button
          className="rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={onPick}
        >
          파일 선택
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {fileName ? `선택된 파일: ${fileName}` : "선택된 파일이 없습니다."}
      </p>
    </div>
  );
}

function FormActions({
  confirmLabel,
  isBusy,
  disabled,
  onClose,
  onConfirm,
}: {
  confirmLabel: string;
  isBusy: boolean;
  disabled: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button
        className="rounded-2xl border border-line px-4 py-2.5 text-sm font-medium text-slate-700"
        disabled={isBusy}
        type="button"
        onClick={onClose}
      >
        닫기
      </button>
      <button
        className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={disabled || isBusy}
        type="button"
        onClick={onConfirm}
      >
        {isBusy ? "저장 중..." : confirmLabel}
      </button>
    </div>
  );
}

function NicknameEditModal({
  initialNickname,
  isBusy,
  onClose,
  onSave,
}: {
  initialNickname: string;
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerNicknameUpdate) => Promise<void>;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const [error, setError] = useState<string | null>(null);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);

  function handleDuplicateCheck() {
    const parsed = dealerNicknameUpdateSchema.safeParse({ nickname });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "닉네임을 다시 확인해 주세요.");
      setCheckMessage(null);
      setCheckedNickname(null);
      return;
    }

    if (parsed.data.nickname === initialNickname.trim()) {
      setError("현재 사용 중인 닉네임과 동일합니다.");
      setCheckMessage(null);
      setCheckedNickname(null);
      return;
    }

    setError(null);
    setCheckMessage("사용 가능한 닉네임입니다.");
    setCheckedNickname(parsed.data.nickname);
  }

  async function handleSave() {
    const parsed = dealerNicknameUpdateSchema.safeParse({ nickname });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "닉네임을 다시 확인해 주세요.");
      return;
    }

    if (checkedNickname !== parsed.data.nickname) {
      setError("중복 확인을 먼저 진행해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="닉네임은 2자 이상 10자 이하, 한글/영문/숫자만 사용할 수 있습니다."
      title="닉네임 변경"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FieldLabel>변경할 닉네임</FieldLabel>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <TextField
                error={error}
                placeholder="변경할 닉네임을 입력하세요."
                value={nickname}
                onChange={(nextValue) => {
                  setNickname(nextValue);
                  setError(null);
                  if (checkedNickname !== nextValue.trim()) {
                    setCheckMessage(null);
                  }
                }}
              />
            </div>
            <button
              className="shrink-0 rounded-2xl border border-line px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={handleDuplicateCheck}
            >
              중복 확인
            </button>
          </div>
        </div>
        {checkMessage && !error ? (
          <p className="text-sm font-medium text-emerald-700">{checkMessage}</p>
        ) : null}
      </div>

      <FormActions
        confirmLabel="저장하기"
        disabled={nickname.trim().length === 0 || checkedNickname !== nickname.trim()}
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
  );
}

function PhoneEditModal({
  initialPhone,
  isBusy,
  onClose,
  onSave,
}: {
  initialPhone: string;
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerPhoneUpdate) => Promise<void>;
}) {
  const [phone, setPhone] = useState(formatPhoneInput(initialPhone));
  const [error, setError] = useState<string | null>(null);

  // TODO(dealer_mypage): 휴대폰번호 수정은 현재 데모 입력만 지원한다.
  // 실제 서비스에서는 휴대폰 본인 인증 intro/webview 또는 외부 인증 수단과 연동해
  // 인증 완료 후 번호를 저장하도록 바꿔야 한다.
  async function handleSave() {
    const parsed = dealerPhoneUpdateSchema.safeParse({ phone });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "휴대폰번호를 다시 확인해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="현재는 데모 입력 화면입니다. 실제 서비스에서는 본인 인증 완료 후 번호가 저장되도록 구현해야 합니다."
      title="휴대폰번호 수정"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
          데모 화면입니다. 현재는 번호를 직접 입력해 저장하지만, 추후 실제 휴대폰 본인 인증
          플로우로 교체해야 합니다.
        </div>
        <div className="space-y-2">
          <FieldLabel>휴대폰번호</FieldLabel>
          <TextField
            error={error}
            placeholder="010-0000-0000"
            type="tel"
            value={phone}
            onChange={(nextValue) => {
              setPhone(formatPhoneInput(nextValue));
              setError(null);
            }}
          />
        </div>
      </div>

      <FormActions
        confirmLabel="저장하기"
        disabled={phone.trim().length === 0}
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
  );
}

function CompanyEditModal({
  initialCompanyName,
  isBusy,
  onClose,
  onSave,
}: {
  initialCompanyName: string;
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerCompanyNameUpdate) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [businessCardFileName, setBusinessCardFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = dealerCompanyNameUpdateSchema.safeParse({
      companyName,
      businessCardFileName,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "업체명을 다시 확인해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="업체명은 거래와 승인 정보에 반영됩니다. 명함 파일은 추후 심사 플로우와 연결될 예정입니다."
      title="업체명 변경"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FieldLabel>업체명</FieldLabel>
          <TextField
            error={error}
            placeholder="소속 딜러사, 에이전시"
            value={companyName}
            onChange={(nextValue) => {
              setCompanyName(nextValue);
              setError(null);
            }}
          />
        </div>

        <FilePickRow
          description="명함 또는 사업자 관련 파일을 첨부해두면 이후 심사 플로우 연결 시 활용할 수 있습니다."
          fileName={businessCardFileName}
          label="명함 파일"
          onPick={() => fileInputRef.current?.click()}
        />
        <input
          className="hidden"
          ref={fileInputRef}
          type="file"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            event.target.value = "";
            setBusinessCardFileName(nextFile?.name ?? null);
          }}
        />
      </div>

      <FormActions
        confirmLabel="저장하기"
        disabled={companyName.trim().length === 0}
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
  );
}

function RecruiterEditModal({
  initialRegistrationNumber,
  isBusy,
  onClose,
  onSave,
}: {
  initialRegistrationNumber: string;
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerRecruiterRegistrationUpdate) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState(
    formatRecruiterRegistrationInput(initialRegistrationNumber),
  );
  const [certificateFileName, setCertificateFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = dealerRecruiterRegistrationUpdateSchema.safeParse({
      recruiterRegistrationNumber: registrationNumber,
      certificateFileName,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "모집인 등록번호를 다시 확인해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="모집인 등록번호가 없으면 할부, 리스 견적을 입찰할 수 없습니다. 등록증 파일은 추후 검수 플로우와 연결됩니다."
      title="모집인 등록번호"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <FieldLabel>모집인 등록번호</FieldLabel>
          <TextField
            error={error}
            placeholder="00-000000000"
            value={registrationNumber}
            onChange={(nextValue) => {
              setRegistrationNumber(formatRecruiterRegistrationInput(nextValue));
              setError(null);
            }}
          />
        </div>

        <FilePickRow
          description="등록증 사본을 첨부해두면 추후 심사 기준과 연동하기 쉽습니다."
          fileName={certificateFileName}
          label="모집인 등록증"
          onPick={() => fileInputRef.current?.click()}
        />
        <input
          className="hidden"
          ref={fileInputRef}
          type="file"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null;
            event.target.value = "";
            setCertificateFileName(nextFile?.name ?? null);
          }}
        />
      </div>

      <FormActions
        confirmLabel="저장하기"
        disabled={registrationNumber.trim().length === 0}
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
  );
}

function PasswordEditModal({
  isBusy,
  onClose,
  onSave,
}: {
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerPasswordChange) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCurrentVisible, setIsCurrentVisible] = useState(false);
  const [isNextVisible, setIsNextVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  async function handleSave() {
    const parsed = dealerPasswordChangeSchema.safeParse({
      currentPassword,
      nextPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "비밀번호 입력값을 다시 확인해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="비밀번호를 변경하면 보안을 위해 다시 로그인해야 합니다."
      title="비밀번호 변경"
      onClose={onClose}
    >
      <div className="space-y-4">
        <PasswordField
          helperText="현재 로그인에 사용하는 비밀번호를 입력해 주세요."
          isVisible={isCurrentVisible}
          label="현재 비밀번호"
          placeholder="현재 비밀번호 입력"
          value={currentPassword}
          onChange={(nextValue) => {
            setCurrentPassword(nextValue);
            setError(null);
          }}
          onToggleVisibility={() => setIsCurrentVisible((current) => !current)}
        />
        <PasswordField
          helperText="영문, 숫자, 특수문자를 포함한 8자 이상으로 입력해 주세요."
          isVisible={isNextVisible}
          label="새 비밀번호"
          placeholder="새 비밀번호 입력"
          value={nextPassword}
          onChange={(nextValue) => {
            setNextPassword(nextValue);
            setError(null);
          }}
          onToggleVisibility={() => setIsNextVisible((current) => !current)}
        />
        <PasswordField
          error={error}
          isVisible={isConfirmVisible}
          label="새 비밀번호 확인"
          placeholder="새 비밀번호 다시 입력"
          value={confirmPassword}
          onChange={(nextValue) => {
            setConfirmPassword(nextValue);
            setError(null);
          }}
          onToggleVisibility={() => setIsConfirmVisible((current) => !current)}
        />
      </div>

      <FormActions
        confirmLabel="변경 완료"
        disabled={
          currentPassword.length === 0 || nextPassword.length === 0 || confirmPassword.length === 0
        }
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
  );
}

function PasswordField({
  label,
  value,
  placeholder,
  isVisible,
  helperText,
  error,
  onChange,
  onToggleVisibility,
}: {
  label: string;
  value: string;
  placeholder: string;
  isVisible: boolean;
  helperText?: string;
  error?: string | null;
  onChange: (nextValue: string) => void;
  onToggleVisibility: () => void;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div
        className={
          error
            ? "flex min-h-12 items-center rounded-2xl border border-rose-300 bg-white px-4"
            : "flex min-h-12 items-center rounded-2xl border border-line bg-white px-4 transition focus-within:border-slate-400"
        }
      >
        <input
          className="w-full border-none bg-transparent text-sm text-slate-950 outline-none"
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className="text-sm font-medium text-slate-500"
          type="button"
          onClick={onToggleVisibility}
        >
          {isVisible ? "숨김" : "보기"}
        </button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {!error && helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}
