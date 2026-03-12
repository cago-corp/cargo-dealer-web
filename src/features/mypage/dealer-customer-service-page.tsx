"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  dealerCustomerServiceQueryKey,
  fetchDealerCustomerService,
} from "@/features/mypage/lib/dealer-mypage-query";
import { SectionCard } from "@/shared/ui/section-card";

export function DealerCustomerServicePage() {
  const serviceQuery = useQuery({
    queryKey: dealerCustomerServiceQueryKey,
    queryFn: fetchDealerCustomerService,
  });
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  if (serviceQuery.isLoading) {
    return <div className="h-[540px] animate-pulse rounded-[32px] bg-slate-100" />;
  }

  if (serviceQuery.isError || !serviceQuery.data) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-rose-700">고객센터 정보를 불러오지 못했습니다.</p>
      </section>
    );
  }

  const service = serviceQuery.data;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
          Customer Service
        </p>
        <h1 className="text-3xl font-semibold text-slate-950">고객센터</h1>
        <p className="text-sm text-slate-600">{service.heroTitle}</p>
      </header>

      <SectionCard title="지원 채널" description={service.heroDescription}>
        <div className="grid gap-4 md:grid-cols-3">
          {service.channels.map((channel) => (
            <div className="rounded-[24px] border border-line bg-slate-50 px-5 py-5" key={channel.id}>
              <p className="text-lg font-semibold text-slate-950">{channel.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{channel.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {channel.availability}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="자주 묻는 질문">
        <div className="space-y-3">
          {service.faqs.map((faq) => {
            const isOpen = faq.id === openFaqId;

            return (
              <div className="rounded-2xl border border-line bg-white" key={faq.id}>
                <button
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  type="button"
                  onClick={() => setOpenFaqId((current) => (current === faq.id ? null : faq.id))}
                >
                  <span className="text-base font-semibold text-slate-950">{faq.question}</span>
                  <span className="text-slate-400">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="border-t border-slate-200 px-5 py-4 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </section>
  );
}
