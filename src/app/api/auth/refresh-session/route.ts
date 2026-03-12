import { NextResponse } from "next/server";
import { DealerAuthError } from "@/shared/auth/auth-error";
import { getDealerEntryRoute } from "@/shared/auth/auth-routing";
import { getDealerAuthClient } from "@/shared/auth/get-dealer-auth-client";
import {
  clearDealerSessionCookie,
  getDealerSession,
  setDealerSessionCookie,
} from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export async function POST() {
  const session = await getDealerSession();

  if (!session) {
    return NextResponse.json(
      {
        message: "로그인 세션이 없습니다.",
        redirectTo: appRoutes.login(),
      },
      { status: 401 },
    );
  }

  try {
    // TODO(auth-session-policy): Spring 전환 또는 인증 정책 확정 후 아래를 정리해야 한다.
    // 1) refresh token 기반 silent refresh 도입 여부
    // 2) 세션 만료 시 공통 모달(예: "세션이 만료되어 다시 로그인해 주세요") 노출 여부
    // 3) 비활성 시간 기준 자동 로그아웃 정책 도입 여부
    // 현재는 accessState만 재확인하고 있으며, 토큰 수명 연장/만료 UX는 의도적으로 미구현 상태다.
    const authClient = getDealerAuthClient();
    const refreshedSession = await authClient.refreshSession(session);
    const response = NextResponse.json({
      accessState: refreshedSession.accessState,
      redirectTo: getDealerEntryRoute(refreshedSession.accessState),
    });

    await setDealerSessionCookie(response, refreshedSession);
    return response;
  } catch (error) {
    const status =
      error instanceof DealerAuthError && error.statusCode >= 400
        ? error.statusCode
        : 500;
    const response = NextResponse.json(
      {
        message:
          error instanceof DealerAuthError
            ? error.message
            : "승인 상태를 확인하지 못했습니다.",
        redirectTo: appRoutes.login(),
      },
      { status },
    );

    if (status === 401 || status === 403) {
      clearDealerSessionCookie(response);
    }

    return response;
  }
}
