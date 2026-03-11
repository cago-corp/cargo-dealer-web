import { NextResponse } from "next/server";
import { dealerSignupSubmitSchema } from "@/features/auth/schemas/dealer-signup-submit-schema";
import { DealerAuthError } from "@/shared/auth/auth-error";
import { getDealerAuthClient } from "@/shared/auth/get-dealer-auth-client";
import { setDealerSessionCookie } from "@/shared/auth/session";
import { appRoutes } from "@/shared/config/routes";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedPayload = dealerSignupSubmitSchema.safeParse(body);

    if (!parsedPayload.success) {
      return NextResponse.json(
        { message: "가입 정보를 다시 확인해주세요." },
        { status: 400 },
      );
    }

    const authClient = getDealerAuthClient();
    const session = await authClient.signup(parsedPayload.data);

    const response = NextResponse.json({
      accessState: session.accessState,
      redirectTo: appRoutes.signupComplete(),
    });

    await setDealerSessionCookie(response, session);
    return response;
  } catch (error) {
    const message =
      error instanceof DealerAuthError
        ? error.message
        : "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
    const status = error instanceof DealerAuthError ? error.statusCode : 500;

    return NextResponse.json({ message }, { status });
  }
}
