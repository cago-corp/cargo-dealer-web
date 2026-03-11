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
