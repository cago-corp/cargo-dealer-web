import { NextResponse } from "next/server";
import { dealerLoginSchema } from "@/features/auth/schemas/dealer-login-schema";
import { DealerAuthError } from "@/shared/auth/auth-error";
import { getDealerAuthClient } from "@/shared/auth/get-dealer-auth-client";
import { setDealerSessionCookie } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = dealerLoginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "이메일 형식과 비밀번호를 다시 확인해주세요." },
      { status: 400 },
    );
  }

  try {
    const authClient = getDealerAuthClient();
    const session = await authClient.login(parsed.data);
    const response = NextResponse.json({
      redirectTo: appRoutes.dashboard(),
      approvalStatus: session.approvalStatus,
    });

    setDealerSessionCookie(response, session);
    return response;
  } catch (error) {
    const authError =
      error instanceof DealerAuthError
        ? error
        : new DealerAuthError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.", 500);

    return NextResponse.json(
      { message: authError.message },
      { status: authError.statusCode },
    );
  }
}
