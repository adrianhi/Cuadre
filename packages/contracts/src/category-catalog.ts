import { z } from 'zod';

export const categoryColorKeySchema = z.enum([
  'emerald', 'blue', 'amber', 'violet', 'pink', 'cyan', 'slate', 'red',
]);
export type CategoryColorKey = z.infer<typeof categoryColorKeySchema>;

export const categoryCatalogItemSchema = z.object({
  id: z.string().nullable(),
  key: z.string().min(1).max(120),
  label: z.string().min(1).max(100),
  kind: z.enum(['SYSTEM', 'CUSTOM', 'LEGACY']),
  colorKey: categoryColorKeySchema,
  icon: z.string().max(16).nullable(),
  isArchived: z.boolean(),
});
export type CategoryCatalogItem = z.infer<typeof categoryCatalogItemSchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido').max(100),
  colorKey: categoryColorKeySchema,
  icon: z.string().trim().max(16).nullable().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = z.object({
  colorKey: categoryColorKeySchema.optional(),
  icon: z.string().trim().max(16).nullable().optional(),
  isArchived: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, 'Incluye al menos un cambio.');
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

export const categoryCatalogResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(categoryCatalogItemSchema),
});

