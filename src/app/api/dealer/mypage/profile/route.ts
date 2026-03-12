import { NextResponse } from "next/server";
import { getDealerSession } from "@/shared/auth/session";
import { fetchDealerProfileForSession } from "@/shared/api/dealer-mypage-server";
import { getSafeRouteErrorMessage, getSafeRouteErrorStatus } from "@/shared/api/route-error";

export async function GET() {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const profile = await fetchDealerProfileForSession(session);
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json(
      { message: getSafeRouteErrorMessage(error, "마이페이지 정보를 불러오지 못했습니다.") },
      { status: getSafeRouteErrorStatus(error, 500) },
    );
  }
}
