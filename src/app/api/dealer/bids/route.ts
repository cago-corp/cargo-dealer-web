import { NextResponse } from "next/server";
import { z } from "zod";
import { dealerBidWizardSubmitSchema } from "@/features/bids/schemas/dealer-bid-wizard-submit-schema";
import { getDealerSession } from "@/shared/auth/session";
import {
  fetchDealerBidListForSession,
  submitDealerBidForSession,
} from "@/shared/api/dealer-bid-server";
import { fetchDealerHomeAuctionDetailForSession } from "@/shared/api/dealer-home-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";
import { checkRateLimit, getRateLimitHeaders } from "@/shared/security/rate-limit";

const dealerBidSubmitRequestSchema = dealerBidWizardSubmitSchema.extend({
  auctionId: z.string().min(1),
});
const dealerBidSubmitRateLimitRule = {
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
} as const;

export async function GET() {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const items = await fetchDealerBidListForSession(session);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "내 입찰 목록을 불러오지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, "dealer:bid-submit", dealerBidSubmitRateLimitRule);

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "입찰 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) },
    );
  }

  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedPayload = dealerBidSubmitRequestSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return NextResponse.json({ message: "입찰 입력값이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const auction = await fetchDealerHomeAuctionDetailForSession(
      session,
      parsedPayload.data.auctionId,
    );
    const submissionId = await submitDealerBidForSession(session, {
      auctionId: parsedPayload.data.auctionId,
      purchaseMethod: auction.purchaseMethod,
      vehiclePrice: auction.askingPriceValue,
      monthlyPaymentValue: parsedPayload.data.monthlyPaymentValue,
      discountAmountValue: parsedPayload.data.discountAmountValue,
      capitalId: parsedPayload.data.capitalId,
      selectedServiceIds: parsedPayload.data.selectedServiceIds,
      note: parsedPayload.data.note,
    });

    return NextResponse.json({ submissionId });
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "입찰 제출에 실패했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
