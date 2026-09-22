import { z } from 'zod';

export const cardRecommendationStatusSchema = z.enum(['EXCELLENT', 'GOOD', 'AVOID_CUT_IMMINENT']);
export type CardRecommendationStatus = z.infer<typeof cardRecommendationStatusSchema>;

export const creditCardSchema = z.object({
  id: z.string().uuid(),
  workspaceId: z.string().uuid(),
  institutionCode: z.string().min(1),
  alias: z.string().min(1),
  cardLast4: z.string().length(4),
  cardType: z.string().default('CREDIT'),
  closingDay: z.number().int().min(1).max(31),
  graceDays: z.number().int().min(0).default(22),
  isDefault: z.boolean().default(false),
  colorTheme: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CreditCard = z.infer<typeof creditCardSchema>;

export const createCreditCardSchema = z.object({
  institutionCode: z.string().trim().min(1, 'La institución financiera es requerida'),
  alias: z.string().trim().min(1, 'El alias de la tarjeta es requerido'),
  cardLast4: z.string().trim().regex(/^\d{4}$/, 'Deben ser exactamente 4 dígitos numéricos'),
  cardType: z.string().trim().default('CREDIT').optional(),
  closingDay: z.coerce.number().int().min(1, 'El día de corte debe ser entre 1 y 31').max(31, 'El día de corte debe ser entre 1 y 31'),
  graceDays: z.coerce.number().int().min(0, 'Los días de gracia no pueden ser negativos').default(22).optional(),
  isDefault: z.boolean().default(false).optional(),
  colorTheme: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});
export type CreateCreditCardInput = z.infer<typeof createCreditCardSchema>;

export const updateCreditCardSchema = createCreditCardSchema.partial();
export type UpdateCreditCardInput = z.infer<typeof updateCreditCardSchema>;

export const cardRecommendationSchema = z.object({
  card: creditCardSchema,
  freeFinancingDays: z.number().int(),
  status: cardRecommendationStatusSchema,
  nextClosingDate: z.string(),
  dueDate: z.string(),
  reason: z.string(),
});
export type CardRecommendation = z.infer<typeof cardRecommendationSchema>;

export const detectedUnregisteredCardSchema = z.object({
  institutionCode: z.string(),
  cardLast4: z.string(),
  transactionCount: z.number().int().nonnegative(),
  lastUsedAt: z.string().nullable(),
});
export type DetectedUnregisteredCard = z.infer<typeof detectedUnregisteredCardSchema>;

export const cardTrafficLightSummarySchema = z.object({
  bestCard: cardRecommendationSchema.nullable(),
  cards: z.array(cardRecommendationSchema),
  detectedUnregisteredCards: z.array(detectedUnregisteredCardSchema),
});
export type CardTrafficLightSummary = z.infer<typeof cardTrafficLightSummarySchema>;
