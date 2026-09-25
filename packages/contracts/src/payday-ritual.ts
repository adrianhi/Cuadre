import { z } from 'zod';
import { budgetCurrencySchema } from './budgets';

export const paydayRitualStatusSchema = z.enum(['UNAVAILABLE', 'OPEN', 'COMPLETED']);
export const paydaySavingsStatusSchema = z.enum(['MET', 'PARTIAL', 'PENDING', 'NOT_SET']);
export type PaydaySavingsStatus = z.infer<typeof paydaySavingsStatusSchema>;

export const paydayRitualSchema = z.object({
  eligible: z.boolean(),
  currency: budgetCurrencySchema,
  status: paydayRitualStatusSchema,
  cycleKey: z.string().nullable(),
  cycleStart: z.string().nullable(),
  cycleEnd: z.string().nullable(),
  plannedIncome: z.number().nonnegative(),
  paidFixed: z.number().nonnegative(),
  otherSpent: z.number().nonnegative(),
  futureFixed: z.number().nonnegative(),
  savingsTarget: z.number().nonnegative().default(0),
  savingsTransferred: z.number().nonnegative().default(0),
  savingsStatus: paydaySavingsStatusSchema.default('NOT_SET'),
  paydayDays: z.array(z.number().int()).default([15, 30]),
  available: z.number().nonnegative(),
  overage: z.number().nonnegative(),
  dailyAvailable: z.number().nonnegative(),
  daysRemaining: z.number().int().nonnegative(),
  completedAt: z.string().nullable(),
});
export type PaydayRitualDto = z.infer<typeof paydayRitualSchema>;
export const paydayRitualResponseSchema = z.object({ success: z.literal(true), data: paydayRitualSchema });
export const completePaydayRitualSchema = z.object({
  cycleKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
