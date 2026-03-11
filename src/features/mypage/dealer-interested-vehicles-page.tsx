"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DealerInterestedVehicleCreate } from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import {
  dealerInterestedVehicleCreateSchema,
  type DealerInterestedVehicle,
} from "@/entities/mypage/schemas/dealer-mypage-detail-schema";
import {
  createDealerInterestedVehicle,
  dealerInterestedVehiclesQueryKey,
  fetchDealerInterestedVehicles,
  removeDealerInterestedVehicle,
} from "@/features/mypage/lib/dealer-mypage-query";
import { SectionCard } from "@/shared/ui/section-card";

type InterestedVehicleTab = "domestic" | "imported";

export function DealerInterestedVehiclesPage() {
  const queryClient = useQueryClient();
  const vehiclesQuery = useQuery({
    queryKey: dealerInterestedVehiclesQueryKey,
    queryFn: fetchDealerInterestedVehicles,
  });
  const [selectedTab, setSelectedTab] = useState<InterestedVehicleTab>("domestic");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: createDealerInterestedVehicle,
    onSuccess: (nextVehicles) => {
      queryClient.setQueryData(dealerInterestedVehiclesQueryKey, nextVehicles);
      setIsCreateOpen(false);
      setStatusMessage("관심 차량이 등록되었습니다.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeDealerInterestedVehicle,
    onSuccess: (nextVehicles) => {
      queryClient.setQueryData(dealerInterestedVehiclesQueryKey, nextVehicles);
      setStatusMessage("관심 차량이 삭제되었습니다.");
    },
  });

  const vehicles = vehiclesQuery.data ?? [];
  const domesticCount = vehicles.filter((item) => item.category === "domestic").length;
  const importedCount = vehicles.filter((item) => item.category === "imported").length;
  const filteredVehicles = vehicles.filter((item) => item.category === selectedTab);

  if (vehiclesQuery.isLoading) {
    return <div className="h-[520px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (vehiclesQuery.isError) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">관심 차량을 불러오지 못했습니다.</p>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
              Interested Vehicles
            </p>
            <h1 className="text-3xl font-semibold text-slate-950">관심 차량</h1>
            <p className="text-sm text-slate-600">
              관심 차량으로 등록해두면 이후 경매 시작 알림이나 추천 목록 기준으로 확장할 수
              있습니다.
            </p>
          </div>
          <button
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setIsCreateOpen(true);
            }}
          >
            + 추가하기
          </button>
        </header>

        {statusMessage ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {statusMessage}
          </div>
        ) : null}

        {createMutation.error instanceof Error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {createMutation.error.message}
          </div>
        ) : null}

        {removeMutation.error instanceof Error ? (
          <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {removeMutation.error.message}
          </div>
        ) : null}

        <SectionCard title="차종 분류">
          <div className="flex flex-wrap items-center gap-3">
            <CategoryChip
              isSelected={selectedTab === "domestic"}
              label={`국산차 ${domesticCount}`}
              onClick={() => setSelectedTab("domestic")}
            />
            <CategoryChip
              isSelected={selectedTab === "imported"}
              label={`수입차 ${importedCount}`}
              onClick={() => setSelectedTab("imported")}
            />
          </div>
        </SectionCard>

        <SectionCard title="등록 목록">
          {filteredVehicles.length === 0 ? (
            <div className="rounded-[28px] bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
                <EmptyBellIcon />
              </div>
              <p className="mt-5 text-xl font-semibold text-slate-950">
                등록된 관심 차량이 없습니다.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                원하는 차량 모델을 등록해두면 해당 경매를 더 빠르게 확인할 수 있습니다.
              </p>
              <button
                className="mt-6 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                type="button"
                onClick={() => {
                  setStatusMessage(null);
                  setIsCreateOpen(true);
                }}
              >
                관심 차량 추가
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVehicles.map((item) => (
                <InterestedVehicleCard
                  isDeleting={removeMutation.isPending && removeMutation.variables === item.id}
                  item={item}
                  key={item.id}
                  onDelete={() => {
                    setStatusMessage(null);
                    void removeMutation.mutateAsync(item.id);
                  }}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </section>

      {isCreateOpen ? (
        <InterestedVehicleCreateModal
          isBusy={createMutation.isPending}
          onClose={() => setIsCreateOpen(false)}
          onSave={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
        />
      ) : null}
    </>
  );
}

function CategoryChip({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={
        isSelected
          ? "rounded-full bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white"
          : "rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
      }
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function InterestedVehicleCard({
  item,
  isDeleting,
  onDelete,
}: {
  item: DealerInterestedVehicle;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const categoryLabel = item.category === "domestic" ? "국산차" : "수입차";

  return (
    <div className="rounded-[24px] border border-line bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-950">{item.label}</p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {categoryLabel}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{item.modelDetail}</p>
          <p className="mt-3 text-xs text-slate-400">{formatCreatedAt(item.createdAt)} 등록</p>
        </div>
        <button
          className="shrink-0 text-sm font-medium text-slate-400 transition hover:text-rose-600"
          disabled={isDeleting}
          type="button"
          onClick={onDelete}
        >
          {isDeleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}

function InterestedVehicleCreateModal({
  isBusy,
  onClose,
  onSave,
}: {
  isBusy: boolean;
  onClose: () => void;
  onSave: (payload: DealerInterestedVehicleCreate) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  const [modelDetail, setModelDetail] = useState("");
  const [category, setCategory] = useState<InterestedVehicleTab>("domestic");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = dealerInterestedVehicleCreateSchema.safeParse({
      label,
      modelDetail,
      category,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "입력값을 다시 확인해 주세요.");
      return;
    }

    await onSave(parsed.data);
  }

  return (
    <FormModalShell
      description="차량명과 세부 정보를 등록해두면 이후 경매 목록이나 알림 기준으로 확장할 수 있습니다."
      title="관심 차량 추가"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <FieldLabel>차종 분류</FieldLabel>
          <div className="flex gap-2">
            <CategoryChip
              isSelected={category === "domestic"}
              label="국산차"
              onClick={() => setCategory("domestic")}
            />
            <CategoryChip
              isSelected={category === "imported"}
              label="수입차"
              onClick={() => setCategory("imported")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>차량명</FieldLabel>
          <TextField
            placeholder="예: BMW 5시리즈"
            value={label}
            onChange={(nextValue) => {
              setLabel(nextValue);
              setError(null);
            }}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel>세부 정보</FieldLabel>
          <TextField
            error={error}
            placeholder="예: 530i xDrive"
            value={modelDetail}
            onChange={(nextValue) => {
              setModelDetail(nextValue);
              setError(null);
            }}
          />
        </div>
      </div>

      <FormActions
        confirmLabel="등록하기"
        disabled={label.trim().length === 0 || modelDetail.trim().length === 0}
        isBusy={isBusy}
        onClose={onClose}
        onConfirm={() => {
          void handleSave();
        }}
      />
    </FormModalShell>
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
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
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
  error,
  onChange,
}: {
  value: string;
  placeholder: string;
  error?: string | null;
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
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

function EmptyBellIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M9.5 18a2.5 2.5 0 0 0 5 0M5 15.5h14l-1.5-2.4V10a5.5 5.5 0 1 0-11 0v3.1L5 15.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
