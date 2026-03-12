import { z } from "zod";

export const dealerBidWizardSubmitSchema = z.object({
  selectedServiceIds: z.array(z.string()),
  note: z.string().trim().max(200),
  monthlyPaymentValue: z.number().int().nonnegative().nullable(),
  discountAmountValue: z.number().int().nonnegative(),
  capitalId: z.string().nullable(),
});

export type DealerBidWizardSubmit = z.infer<
  typeof dealerBidWizardSubmitSchema
>;
