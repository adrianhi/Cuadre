import { z } from 'zod';

export const coroStatusSchema = z.enum(['ACTIVE', 'LOCKED', 'ARCHIVED']);
export const coroSettlementStatusSchema = z.enum(['PENDING', 'MARKED_PAID', 'CONFIRMED']);
export const coroCurrencySchema = z.enum(['DOP', 'USD']);
export const coroBankCodeSchema = z.enum(['POPULAR', 'BHD', 'BANRESERVAS']);

const moneySchema = z.coerce.number().positive().max(100_000_000).refine(
  (value) => Math.abs(Math.round(value * 100) - value * 100) < 0.000001,
  'El monto admite como máximo dos decimales',
);

export const coroPaymentDestinationSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('BANK'),
    bankCode: coroBankCodeSchema,
    accountType: z.enum(['SAVINGS', 'CHECKING']),
    accountNumber: z.string().trim().min(4).max(34),
    accountHolder: z.string().trim().min(2).max(100),
  }),
  z.object({
    kind: z.literal('QIK'),
    phoneNumber: z.string().trim().regex(/^\+?1?8(?:09|29|49)\d{7}$/, 'Número dominicano inválido'),
    accountHolder: z.string().trim().min(2).max(100),
  }),
]);

export const coroParticipantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isOwner: z.boolean(),
  isClaimed: z.boolean(),
  paymentDestination: coroPaymentDestinationSchema.nullable().optional(),
  totalPaid: z.number(),
  totalOwed: z.number(),
  netBalance: z.number(),
});

export const coroExpenseSchema = z.object({
  id: z.string().uuid(),
  paidById: z.string().uuid(),
  paidByName: z.string(),
  createdByParticipantId: z.string().uuid(),
  title: z.string(),
  amount: z.number(),
  currency: coroCurrencySchema,
  category: z.string(),
  expenseDate: z.string().datetime(),
  notes: z.string().nullable(),
  splitParticipantIds: z.array(z.string().uuid()),
  transactionId: z.string().nullable(),
  canEdit: z.boolean(),
});

export const coroTransferSuggestionSchema = z.object({
  id: z.string().uuid().nullable(),
  fromId: z.string().uuid(),
  fromName: z.string(),
  toId: z.string().uuid(),
  toName: z.string(),
  amount: z.number(),
  status: coroSettlementStatusSchema,
  toPaymentDestination: coroPaymentDestinationSchema.nullable().optional(),
  canMarkPaid: z.boolean(),
  canConfirm: z.boolean(),
});

export const coroPublicDetailSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  currency: coroCurrencySchema,
  status: coroStatusSchema,
  totalAmount: z.number(),
  viewerParticipantId: z.string().uuid().nullable(),
  participants: z.array(coroParticipantSchema),
  expenses: z.array(coroExpenseSchema),
  settlements: z.array(coroTransferSuggestionSchema),
  createdAt: z.string().datetime(),
  lockedAt: z.string().datetime().nullable(),
  archivedAt: z.string().datetime().nullable(),
});

export const coroGroupSummarySchema = z.object({
  id: z.string().uuid(), slug: z.string(), name: z.string(), description: z.string().nullable(),
  currency: coroCurrencySchema, status: coroStatusSchema, participantCount: z.number().int(),
  expenseCount: z.number().int(), totalAmount: z.number(), updatedAt: z.string().datetime(),
});

export const coroCandidateTransactionSchema = z.object({
  id: z.string(), merchant: z.string(), amount: z.number(), currency: coroCurrencySchema,
  category: z.string(), transactionDate: z.string().datetime(), institutionCode: z.string(),
});

export const claimCoroResultSchema = z.object({
  token: z.string(), participantId: z.string().uuid(), detail: coroPublicDetailSchema,
});

export const createCoroGroupInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  currency: coroCurrencySchema.default('DOP'),
  participantNames: z.array(z.string().trim().min(1).max(80)).max(49).default([]),
});

export const updateCoroGroupInputSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, 'No hay cambios para guardar');

export const claimCoroParticipantInputSchema = z.object({
  participantId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
}).refine((value) => value.participantId || value.name, 'Selecciona o crea un participante');

export const createCoroParticipantInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const createCoroExpenseInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  amount: moneySchema,
  paidById: z.string().uuid(),
  category: z.string().trim().min(1).max(60).default('Varios'),
  expenseDate: z.string().datetime(),
  notes: z.string().trim().max(500).nullable().optional(),
  splitParticipantIds: z.array(z.string().uuid()).min(1).max(50),
  allowPossibleDuplicate: z.boolean().default(false),
});

export const updateCoroExpenseInputSchema = createCoroExpenseInputSchema
  .omit({ allowPossibleDuplicate: true })
  .partial()
  .extend({ allowPossibleDuplicate: z.boolean().default(false) })
  .refine((value) => Object.keys(value).length > 0, 'No hay cambios para guardar');

export const updateCoroPaymentInputSchema = z.object({
  paymentDestination: coroPaymentDestinationSchema.nullable(),
});

export const linkCoroTransactionInputSchema = z.object({
  transactionId: z.string().min(1),
  splitParticipantIds: z.array(z.string().uuid()).min(1).max(50),
  allowPossibleDuplicate: z.boolean().default(false),
});

export type CoroStatus = z.infer<typeof coroStatusSchema>;
export type CoroSettlementStatus = z.infer<typeof coroSettlementStatusSchema>;
export type CoroPaymentDestination = z.infer<typeof coroPaymentDestinationSchema>;
export type CoroParticipant = z.infer<typeof coroParticipantSchema>;
export type CoroExpense = z.infer<typeof coroExpenseSchema>;
export type CoroTransferSuggestion = z.infer<typeof coroTransferSuggestionSchema>;
export type CoroPublicDetail = z.infer<typeof coroPublicDetailSchema>;
export type CoroGroupSummary = z.infer<typeof coroGroupSummarySchema>;
export type CoroCandidateTransaction = z.infer<typeof coroCandidateTransactionSchema>;
export type CreateCoroGroupInput = z.infer<typeof createCoroGroupInputSchema>;
export type UpdateCoroGroupInput = z.infer<typeof updateCoroGroupInputSchema>;
export type ClaimCoroParticipantInput = z.infer<typeof claimCoroParticipantInputSchema>;
export type CreateCoroExpenseInput = z.infer<typeof createCoroExpenseInputSchema>;
export type UpdateCoroExpenseInput = z.infer<typeof updateCoroExpenseInputSchema>;
export type LinkCoroTransactionInput = z.infer<typeof linkCoroTransactionInputSchema>;
