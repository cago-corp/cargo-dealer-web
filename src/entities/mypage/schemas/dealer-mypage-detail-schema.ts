import { z } from "zod";

export const dealerMyInfoSchema = z.object({
  dealerName: z.string(),
  dealerNickname: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string(),
  recruiterRegistrationNumber: z.string().nullable(),
  approvalStatus: z.enum(["active", "pending"]),
  joinedAt: z.string().datetime(),
});

export const dealerNicknameUpdateSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(10, "닉네임은 10자 이하로 입력해 주세요.")
    .regex(/^[a-zA-Z0-9가-힣]+$/, "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다."),
});

export const dealerPhoneUpdateSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^010-\d{4}-\d{4}$/, "휴대폰번호 형식을 확인해 주세요."),
});

export const dealerCompanyNameUpdateSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "업체명을 입력해 주세요.")
    .max(40, "업체명은 40자 이하로 입력해 주세요."),
  businessCardFileName: z.string().trim().min(1).nullable().optional(),
});

export const dealerRecruiterRegistrationUpdateSchema = z.object({
  recruiterRegistrationNumber: z
    .string()
    .trim()
    .regex(/^\d{2}-\d{9}$/, "모집인 등록번호 형식을 확인해 주세요."),
  certificateFileName: z.string().trim().min(1).nullable().optional(),
});

export const dealerPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해 주세요."),
    nextPassword: z
      .string()
      .min(8, "새 비밀번호는 8자 이상이어야 합니다.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        "영문, 숫자, 특수문자를 모두 포함해 주세요.",
      ),
    confirmPassword: z.string().min(1, "새 비밀번호 확인을 입력해 주세요."),
  })
  .superRefine((value, context) => {
    if (value.currentPassword === value.nextPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "현재 비밀번호와 다른 비밀번호를 입력해 주세요.",
        path: ["nextPassword"],
      });
    }

    if (value.nextPassword !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "새 비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
      });
    }
  });

export const dealerNotificationSettingsSchema = z.object({
  serviceAlertEnabled: z.boolean(),
  marketingAlertEnabled: z.boolean(),
  browserPushEnabled: z.boolean(),
  browserPushStatusLabel: z.string(),
  quietHoursEnabled: z.boolean(),
  quietHoursRangeLabel: z.string(),
});

export const dealerInterestedVehicleSchema = z.object({
  id: z.string(),
  label: z.string(),
  modelDetail: z.string(),
  category: z.enum(["domestic", "imported"]),
  createdAt: z.string().datetime(),
});

export const dealerInterestedVehicleCreateSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "차량명을 입력해 주세요.")
    .max(40, "차량명은 40자 이하로 입력해 주세요."),
  modelDetail: z
    .string()
    .trim()
    .min(2, "세부 정보를 입력해 주세요.")
    .max(60, "세부 정보는 60자 이하로 입력해 주세요."),
  category: z.enum(["domestic", "imported"]),
});

export const dealerTermTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
});

export const dealerTermSchema = z.object({
  id: z.string(),
  typeId: z.string(),
  name: z.string(),
  content: z.string(),
});

export const dealerCustomerServiceChannelSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  availability: z.string(),
});

export const dealerCustomerServiceFaqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const dealerCustomerServiceSchema = z.object({
  heroTitle: z.string(),
  heroDescription: z.string(),
  channels: dealerCustomerServiceChannelSchema.array(),
  faqs: dealerCustomerServiceFaqSchema.array(),
});

export const dealerReviewWorkspaceSchema = z.object({
  reviewCount: z.number().int().nonnegative(),
  averageRating: z.number().min(0).max(5),
  policySummary: z.string(),
  recentSummary: z.string(),
  ratingBreakdown: z.array(
    z.object({
      score: z.number().int().min(1).max(5),
      count: z.number().int().nonnegative(),
    }),
  ),
  recentReviews: z.array(
    z.object({
      id: z.string(),
      customerName: z.string(),
      rating: z.number().int().min(1).max(5),
      title: z.string(),
      body: z.string(),
      vehicleLabel: z.string(),
      createdAt: z.string().datetime(),
      tags: z.array(z.string()),
      flagged: z.boolean(),
      statusLabel: z.string(),
    }),
  ),
});

export type DealerMyInfo = z.infer<typeof dealerMyInfoSchema>;
export type DealerNicknameUpdate = z.infer<typeof dealerNicknameUpdateSchema>;
export type DealerPhoneUpdate = z.infer<typeof dealerPhoneUpdateSchema>;
export type DealerCompanyNameUpdate = z.infer<typeof dealerCompanyNameUpdateSchema>;
export type DealerRecruiterRegistrationUpdate = z.infer<
  typeof dealerRecruiterRegistrationUpdateSchema
>;
export type DealerPasswordChange = z.infer<typeof dealerPasswordChangeSchema>;
export type DealerNotificationSettings = z.infer<typeof dealerNotificationSettingsSchema>;
export type DealerInterestedVehicle = z.infer<typeof dealerInterestedVehicleSchema>;
export type DealerInterestedVehicleCreate = z.infer<typeof dealerInterestedVehicleCreateSchema>;
export type DealerTermType = z.infer<typeof dealerTermTypeSchema>;
export type DealerTerm = z.infer<typeof dealerTermSchema>;
export type DealerCustomerService = z.infer<typeof dealerCustomerServiceSchema>;
export type DealerReviewWorkspace = z.infer<typeof dealerReviewWorkspaceSchema>;
