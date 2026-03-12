import { z } from "zod";
import {
  dealerSignupFormFieldsSchema,
  dealerSignupCardSchema,
} from "@/features/auth/schemas/dealer-signup-form-schema";

export const dealerSignupSubmitSchema = dealerSignupFormFieldsSchema
  .pick({
    email: true,
    name: true,
    nickname: true,
    password: true,
    phone: true,
  })
  .merge(
    dealerSignupCardSchema.pick({
      companyName: true,
    }),
  )
  .extend({
    marketingNotificationOptIn: z.literal(true),
    tosAgreed: z.literal(true),
  });

export type DealerSignupSubmitInput = z.infer<typeof dealerSignupSubmitSchema>;
