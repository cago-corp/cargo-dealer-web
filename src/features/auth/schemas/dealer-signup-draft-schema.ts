import { z } from "zod";

export const dealerSignupDraftSchema = z.object({
  marketingAgreed: z.boolean().default(false),
  communityAgreed: z.boolean().default(false),
  email: z.string().default(""),
  password: z.string().default(""),
  passwordConfirm: z.string().default(""),
  name: z.string().default(""),
  nickname: z.string().default(""),
  phone: z.string().default(""),
  companyName: z.string().default(""),
  salespersonName: z.string().default(""),
  businessCardFileName: z.string().default(""),
});

export type DealerSignupDraft = z.infer<typeof dealerSignupDraftSchema>;

export const emptyDealerSignupDraft = dealerSignupDraftSchema.parse({});
