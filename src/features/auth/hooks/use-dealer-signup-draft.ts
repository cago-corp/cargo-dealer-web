"use client";

import { useEffect, useState } from "react";
import {
  dealerSignupDraftSchema,
  emptyDealerSignupDraft,
  type DealerSignupDraft,
} from "@/features/auth/schemas/dealer-signup-draft-schema";

const dealerSignupDraftStorageKey = "cargo-dealer-signup-draft";

export function useDealerSignupDraft() {
  const [draft, setDraftState] = useState<DealerSignupDraft>(emptyDealerSignupDraft);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawValue = window.sessionStorage.getItem(dealerSignupDraftStorageKey);
      if (rawValue) {
        const parsed = dealerSignupDraftSchema.safeParse(JSON.parse(rawValue));
        if (parsed.success) {
          setDraftState(parsed.data);
        }
      }
    } catch {
      window.sessionStorage.removeItem(dealerSignupDraftStorageKey);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.sessionStorage.setItem(
      dealerSignupDraftStorageKey,
      JSON.stringify(draft),
    );
  }, [draft, isHydrated]);

  function updateDraft(patch: Partial<DealerSignupDraft>) {
    setDraftState((current) => ({
      ...current,
      ...patch,
    }));
  }

  function clearDraft() {
    setDraftState(emptyDealerSignupDraft);
    window.sessionStorage.removeItem(dealerSignupDraftStorageKey);
  }

  return {
    clearDraft,
    draft,
    isHydrated,
    updateDraft,
  };
}
