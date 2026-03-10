import { z } from "zod";

const passwordPattern =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
const phonePattern = /^010\d{7,8}$/;

export const dealerSignupFormSchema = z
  .object({
    email: z.string().trim().email("올바른 이메일 형식이 아닙니다."),
    password: z
      .string()
      .min(1, "비밀번호를 입력해주세요.")
      .regex(
        passwordPattern,
        "비밀번호는 8자 이상이며, 영문, 숫자, 특수문자를 포함해야 합니다.",
      ),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    name: z.string().trim().min(1, "이름을 입력해주세요."),
    nickname: z.string().trim().min(1, "닉네임을 입력해주세요."),
    phone: z
      .string()
      .trim()
      .regex(phonePattern, "올바른 연락처 형식이 아닙니다. ('-' 제외)"),
  })
  .superRefine((value, context) => {
    if (value.password !== value.passwordConfirm) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["passwordConfirm"],
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
  });

export const dealerSignupCardSchema = z.object({
  companyName: z.string().trim().min(1, "업체명을 입력해주세요."),
  salespersonName: z.string().trim().min(1, "담당자명을 입력해주세요."),
  businessCardFileName: z.string().trim().min(1, "명함 사진을 첨부해주세요."),
});

export type DealerSignupFormInput = z.infer<typeof dealerSignupFormSchema>;
export type DealerSignupCardInput = z.infer<typeof dealerSignupCardSchema>;
