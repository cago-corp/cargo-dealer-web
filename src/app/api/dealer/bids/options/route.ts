import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import {
  fetchDealerBidCapitalOptionsForSession,
  fetchDealerBidServiceOptionsForSession,
} from "@/shared/api/dealer-bid-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

export async function GET() {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const [serviceOptions, capitalOptions] = await Promise.all([
      fetchDealerBidServiceOptionsForSession(session),
      fetchDealerBidCapitalOptionsForSession(session),
    ]);

    return NextResponse.json({
      serviceOptions,
      capitalOptions,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "입찰 옵션을 불러오지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
