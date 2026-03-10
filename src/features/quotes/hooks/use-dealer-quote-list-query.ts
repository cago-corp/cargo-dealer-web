"use client";

import { useQuery } from "@tanstack/react-query";
import {
  dealerQuoteListQueryKey,
  fetchDealerQuoteList,
} from "@/features/quotes/lib/dealer-quote-list-query";

export function useDealerQuoteListQuery() {
  return useQuery({
    queryKey: dealerQuoteListQueryKey,
    queryFn: fetchDealerQuoteList,
  });
}
